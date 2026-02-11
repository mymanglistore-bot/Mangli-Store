
"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ADMIN_PASS, DEFAULT_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, ShieldAlert, Database, Loader2, Upload, X, Image as ImageIcon, Settings, Sparkles, Info, Tags, Edit2, LayoutGrid, TicketPercent, TrendingDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useDoc, useMemoFirebase, deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking, useAuth, initiateAnonymousSignIn } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    description: "",
    category: "",
    unit: "Unit",
    imageUrl: "",
    inStock: true,
    isDiscounted: false
  });

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);

  const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsQuery);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'store');
  }, [firestore]);

  const { data: settings } = useDoc<any>(settingsRef);

  const activeCategories = settings?.categories || DEFAULT_CATEGORIES;

  const discountedProducts = products?.filter(p => p.isDiscounted) || [];

  const handleLogin = () => {
    if (password.trim() === ADMIN_PASS) {
      if (auth) {
        initiateAnonymousSignIn(auth);
      }
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "You are now signed in as an administrator.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Incorrect administrative password.",
      });
    }
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024) { 
        toast({ variant: "destructive", title: "Image too large", description: "Limit is 50KB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit && editingProduct) {
          setEditingProduct({ ...editingProduct, imageUrl: reader.result as string });
        } else {
          setNewProduct({ ...newProduct, imageUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && firestore) {
      if (file.size > 1024 * 1024) { 
        toast({ variant: "destructive", title: "Image too large", description: "Hero image limit is 1MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const docRef = doc(firestore, 'settings', 'store');
        setDocumentNonBlocking(docRef, { heroImageUrl: reader.result as string }, { merge: true });
        toast({ title: "Hero Image Updated", description: "The store banner has been changed." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && firestore) {
      if (file.size > 100 * 1024) { 
        toast({ variant: "destructive", title: "Image too large", description: "Logo limit is 100KB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const docRef = doc(firestore, 'settings', 'store');
        setDocumentNonBlocking(docRef, { logoImageUrl: reader.result as string }, { merge: true });
        toast({ title: "Logo Updated", description: "The store logo has been changed." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !newProduct.imageUrl || !newProduct.category) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please provide all details and an image." });
        return;
    }
    const productsRef = collection(firestore, 'products');
    const newDocRef = doc(productsRef);
    
    const productData: Product = {
      id: newDocRef.id,
      name: newProduct.name,
      price: Number(newProduct.price),
      originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
      description: newProduct.description,
      category: newProduct.category,
      unit: newProduct.unit || "Unit",
      imageUrl: newProduct.imageUrl,
      inStock: newProduct.inStock,
      isDiscounted: newProduct.isDiscounted
    };
    setDocumentNonBlocking(newDocRef, productData, { merge: true });
    setIsAddDialogOpen(false);
    setNewProduct({ name: "", price: "", originalPrice: "", description: "", category: "", unit: "Unit", imageUrl: "", inStock: true, isDiscounted: false });
    toast({ title: "Product Added", description: `${productData.name} is now live.` });
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !editingProduct) return;

    const docRef = doc(firestore, 'products', editingProduct.id);
    const updateData = {
      ...editingProduct,
      price: Number(editingProduct.price),
      originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined
    };

    updateDocumentNonBlocking(docRef, updateData);
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    toast({ title: "Product Updated", description: `${updateData.name} has been updated.` });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct({
      ...product,
      price: product.price,
      originalPrice: product.originalPrice ?? ""
    });
    setIsEditDialogOpen(true);
  };

  const toggleStockStatus = (product: Product) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'products', product.id);
    updateDocumentNonBlocking(docRef, { inStock: !product.inStock });
    toast({ 
      title: "Stock Updated", 
      description: `${product.name} is now ${!product.inStock ? 'In Stock' : 'Out of Stock'}.` 
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !firestore) return;
    const updatedCategories = [...activeCategories, newCategoryName.trim()];
    const docRef = doc(firestore, 'settings', 'store');
    setDocumentNonBlocking(docRef, { categories: updatedCategories }, { merge: true });
    setNewCategoryName("");
    toast({ title: "Category Added", description: `Added ${newCategoryName} to the list.` });
  };

  const handleDeleteCategory = (index: number) => {
    if (!firestore) return;
    const updatedCategories = activeCategories.filter((_: any, i: number) => i !== index);
    const docRef = doc(firestore, 'settings', 'store');
    setDocumentNonBlocking(docRef, { categories: updatedCategories }, { merge: true });
    toast({ title: "Category Deleted", description: "The category has been removed." });
  };

  const handleEditCategory = (index: number) => {
    setEditingCategoryIndex(index);
    setNewCategoryName(activeCategories[index]);
  };

  const handleSaveCategoryEdit = () => {
    if (editingCategoryIndex === null || !newCategoryName.trim() || !firestore) return;
    const updatedCategories = [...activeCategories];
    updatedCategories[editingCategoryIndex] = newCategoryName.trim();
    const docRef = doc(firestore, 'settings', 'store');
    setDocumentNonBlocking(docRef, { categories: updatedCategories }, { merge: true });
    setEditingCategoryIndex(null);
    setNewCategoryName("");
    toast({ title: "Category Updated", description: "The category name has been changed." });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your secret administrative password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
            />
            <Button onClick={handleLogin} className="w-full h-12">Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Database className="h-4 w-4" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="discounts" className="flex items-center gap-2">
              <TicketPercent className="h-4 w-4" /> Discount Corner
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" /> Categories
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Branding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Product Catalog</h1>
                <p className="text-sm text-muted-foreground">Manage your store's live inventory</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                      <Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      <DialogHeader>
                          <DialogTitle>New Product</DialogTitle>
                          <DialogDescription>Enter the details of the new item to add to your catalog.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" required value={newProduct.name ?? ""} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                        </div>
                        <div className="flex gap-4">
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="price">Price (Rs.)</Label>
                            <Input id="price" type="number" required value={newProduct.price ?? ""} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                          </div>
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="unit">Unit (e.g. Kg, g, Unit)</Label>
                            <Input id="unit" required value={newProduct.unit ?? ""} onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})} placeholder="Kg, g, Unit, etc." />
                          </div>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="category">Category</Label>
                          <Select 
                            value={newProduct.category ?? ""} 
                            onValueChange={(val) => setNewProduct({...newProduct, category: val})}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {activeCategories.map((cat: string) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                          <Label>Image</Label>
                          <div className="mt-1 border-2 border-dashed p-4 rounded-lg flex flex-col items-center justify-center relative hover:bg-muted/50 transition-colors">
                            {newProduct.imageUrl ? (
                                <img src={newProduct.imageUrl} className="max-h-32 rounded shadow-sm" alt="Preview" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Upload className="h-8 w-8" />
                                    <span className="text-xs">Click to upload from PC</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleProductFileChange(e, false)} />
                          </div>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="desc">Description</Label>
                          <Textarea id="desc" required value={newProduct.description ?? ""} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                        </div>

                        <div className="flex flex-col gap-4 pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="stock-new">In Stock Initially?</Label>
                            <Switch id="stock-new" checked={newProduct.inStock} onCheckedChange={(val) => setNewProduct({...newProduct, inStock: val})} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <Label htmlFor="discount-new">Discount Deal?</Label>
                              <span className="text-[10px] text-muted-foreground">Show in Discount Corner</span>
                            </div>
                            <Switch id="discount-new" checked={newProduct.isDiscounted} onCheckedChange={(val) => setNewProduct({...newProduct, isDiscounted: val})} />
                          </div>
                          {newProduct.isDiscounted && (
                            <div className="grid w-full items-center gap-1.5 animate-in slide-in-from-top-1">
                              <Label htmlFor="original-price-new">Original Price (Before Discount)</Label>
                              <Input id="original-price-new" type="number" placeholder="e.g. 150" value={newProduct.originalPrice ?? ""} onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})} />
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                          <Button type="submit" className="w-full">Save Product</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>In Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isProductsLoading ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : products?.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No products found.</TableCell></TableRow>
                  ) : products?.map(p => (
                    <TableRow key={p.id}>
                      <TableCell><img src={p.imageUrl} className="w-10 h-10 object-cover rounded shadow-sm" alt={p.name} /></TableCell>
                      <TableCell className="font-medium">
                        {p.name}
                        {p.isDiscounted && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary uppercase">
                            Discount
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/20 rounded-full text-[10px] font-bold">
                          <Tags className="h-3 w-3" /> {p.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">Rs. {p.price}</span>
                          {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                            <span className="text-[10px] text-muted-foreground line-through decoration-destructive/30">Rs. {p.originalPrice}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch checked={p.inStock} onCheckedChange={() => toggleStockStatus(p)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(p)} className="text-primary hover:text-primary hover:bg-primary/10">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(firestore, 'products', p.id))} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="discounts">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Discount Corner Management</h1>
              <p className="text-sm text-muted-foreground">Products listed here will appear in the special section on the home page.</p>
            </div>
            
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Original Price</TableHead>
                    <TableHead>Savings</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isProductsLoading ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : discountedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center flex flex-col items-center justify-center text-muted-foreground">
                          <TicketPercent className="h-12 w-12 opacity-20 mb-2" />
                          <p>No discounted products found.</p>
                          <p className="text-xs">Edit a product and toggle "Discount Deal" to add it here.</p>
                        </TableCell>
                      </TableRow>
                  ) : discountedProducts.map(p => {
                    const savings = p.originalPrice ? Number(p.originalPrice) - Number(p.price) : 0;
                    return (
                      <TableRow key={p.id}>
                        <TableCell><img src={p.imageUrl} className="w-10 h-10 object-cover rounded shadow-sm" alt={p.name} /></TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-primary font-bold">Rs. {p.price}</TableCell>
                        <TableCell className="text-muted-foreground line-through">Rs. {p.originalPrice || '-'}</TableCell>
                        <TableCell>
                          {savings > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">
                              <TrendingDown className="h-3 w-3" /> Rs. {savings} OFF
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No original price set</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(p)}>
                            Edit Deal
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Add, edit or delete categories for your product catalog.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Input 
                    placeholder="New category name..." 
                    value={newCategoryName ?? ""} 
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        editingCategoryIndex !== null ? handleSaveCategoryEdit() : handleAddCategory();
                      }
                    }}
                  />
                  {editingCategoryIndex !== null ? (
                    <>
                      <Button onClick={handleSaveCategoryEdit}>Save</Button>
                      <Button variant="ghost" onClick={() => { setEditingCategoryIndex(null); setNewCategoryName(""); }}>Cancel</Button>
                    </>
                  ) : (
                    <Button onClick={handleAddCategory}><Plus className="h-4 w-4 mr-2" /> Add</Button>
                  )}
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeCategories.map((cat: string, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{cat}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditCategory(index)} className="h-8 w-8 text-primary">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(index)} className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Logo</CardTitle>
                <CardDescription>Upload your brand logo (displayed in header and footer).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="w-32 h-20 rounded-md border-2 border-dashed flex items-center justify-center relative overflow-hidden bg-muted group">
                    {settings?.logoImageUrl ? (
                      <img src={settings.logoImageUrl} className="w-full h-full object-contain" alt="Store Logo" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <Upload className="h-6 w-6 text-white" />
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoFileChange} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Click image to upload</p>
                    <p className="text-xs text-muted-foreground">Recommended: 400x250px PNG/JPG. Max 100KB.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Section Image</CardTitle>
                <CardDescription>Upload an image from your PC to display in the home page banner.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-[3/1] w-full max-w-2xl mx-auto rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden bg-muted group">
                  {settings?.heroImageUrl ? (
                    <img src={settings.heroImageUrl} className="w-full h-full object-cover" alt="Hero Banner" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <div className="text-white flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8" />
                      <span className="font-bold">Change Hero Image</span>
                    </div>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleHeroFileChange} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Info className="h-3 w-3" />
                    Recommended: 600x200px Wide Banner. Max 1MB.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {editingProduct && (
            <form onSubmit={handleEditProduct} className="space-y-4">
              <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>Modify the details of your product.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input id="edit-name" required value={editingProduct.name ?? ""} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="edit-price">Price (Rs.)</Label>
                    <Input id="edit-price" type="number" required value={editingProduct.price ?? ""} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="edit-unit">Unit</Label>
                    <Input id="edit-unit" required value={editingProduct.unit ?? ""} onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})} />
                  </div>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editingProduct.category ?? ""} 
                    onValueChange={(val) => setEditingProduct({...editingProduct, category: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCategories.map((cat: string) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label>Image</Label>
                  <div className="mt-1 border-2 border-dashed p-4 rounded-lg flex flex-col items-center justify-center relative hover:bg-muted/50 transition-colors">
                    <img src={editingProduct.imageUrl} className="max-h-32 rounded shadow-sm" alt="Preview" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleProductFileChange(e, true)} />
                  </div>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="edit-desc">Description</Label>
                  <Textarea id="edit-desc" required value={editingProduct.description ?? ""} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} />
                </div>

                <div className="flex flex-col gap-4 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-stock">In Stock?</Label>
                    <Switch id="edit-stock" checked={editingProduct.inStock} onCheckedChange={(val) => setEditingProduct({...editingProduct, inStock: val})} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <Label htmlFor="edit-discount">Discount Deal?</Label>
                      <span className="text-[10px] text-muted-foreground">Show in Discount Corner</span>
                    </div>
                    <Switch id="edit-discount" checked={editingProduct.isDiscounted} onCheckedChange={(val) => setEditingProduct({...editingProduct, isDiscounted: val})} />
                  </div>
                  {editingProduct.isDiscounted && (
                    <div className="grid w-full items-center gap-1.5 animate-in slide-in-from-top-1">
                      <Label htmlFor="edit-original-price">Original Price (Before Discount)</Label>
                      <Input id="edit-original-price" type="number" value={editingProduct.originalPrice ?? ""} onChange={(e) => setEditingProduct({...editingProduct, originalPrice: e.target.value})} />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                  <Button type="submit" className="w-full">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
