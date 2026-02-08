
"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ADMIN_PASS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, ShieldAlert, Database, Loader2, Upload, X, Image as ImageIcon, Settings, Sparkles } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useDoc, useMemoFirebase, deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking, useAuth, initiateAnonymousSignIn } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "Groceries",
    imageUrl: "",
    inStock: true
  });

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

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) { 
        toast({ variant: "destructive", title: "Image too large", description: "Limit is 800KB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct({ ...newProduct, imageUrl: reader.result as string });
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

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !newProduct.imageUrl) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please provide all details and an image." });
        return;
    }
    const productsRef = collection(firestore, 'products');
    const newDocRef = doc(productsRef);
    const productData: Product = {
      id: newDocRef.id,
      name: newProduct.name,
      price: Number(newProduct.price),
      description: newProduct.description,
      category: newProduct.category,
      imageUrl: newProduct.imageUrl,
      inStock: newProduct.inStock
    };
    setDocumentNonBlocking(newDocRef, productData, { merge: true });
    setIsAddDialogOpen(false);
    setNewProduct({ name: "", price: "", description: "", category: "Groceries", imageUrl: "", inStock: true });
    toast({ title: "Product Added", description: `${productData.name} is now live.` });
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

  const seedDatabase = () => {
    if (!firestore) return;
    PlaceHolderImages.forEach(img => {
      const productsRef = collection(firestore, 'products');
      const newDocRef = doc(productsRef);
      const productData: Product = {
        id: newDocRef.id,
        name: img.description,
        price: Math.floor(Math.random() * 100) + 50,
        description: `Premium quality ${img.description.toLowerCase()} for your kitchen.`,
        category: "Groceries",
        imageUrl: img.imageUrl,
        inStock: true
      };
      setDocumentNonBlocking(newDocRef, productData, { merge: true });
    });
    toast({ title: "Database Seeded", description: "Mock products have been added to your catalog." });
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
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Branding & Hero
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Product Catalog</h1>
                <p className="text-sm text-muted-foreground">Manage your store's live inventory</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={seedDatabase} className="hidden sm:flex">
                  <Sparkles className="h-4 w-4 mr-2" /> Seed Data
                </Button>
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
                          <Input id="name" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="price">Price (Rs.)</Label>
                          <Input id="price" type="number" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
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
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleProductFileChange} />
                          </div>
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="desc">Description</Label>
                          <Textarea id="desc" required value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <Label htmlFor="stock-new">In Stock Initially?</Label>
                          <Switch id="stock-new" checked={newProduct.inStock} onCheckedChange={(val) => setNewProduct({...newProduct, inStock: val})} />
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
                    <TableHead>Price</TableHead>
                    <TableHead>In Stock</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isProductsLoading ? (
                      <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : products?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No products found.</TableCell></TableRow>
                  ) : products?.map(p => (
                    <TableRow key={p.id}>
                      <TableCell><img src={p.imageUrl} className="w-10 h-10 object-cover rounded shadow-sm" alt={p.name} /></TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>Rs. {p.price}</TableCell>
                      <TableCell>
                        <Switch checked={p.inStock} onCheckedChange={() => toggleStockStatus(p)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(firestore, 'products', p.id))} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section Image</CardTitle>
                <CardDescription>Upload an image from your PC to display in the home page banner.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden bg-muted group">
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
                {settings?.heroImageUrl && (
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={() => setDocumentNonBlocking(doc(firestore, 'settings', 'store'), { heroImageUrl: "" }, { merge: true })}>
                      <X className="h-4 w-4 mr-2" /> Remove Custom Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
