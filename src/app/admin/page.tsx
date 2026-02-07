
"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ADMIN_PASS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Edit2, ShieldAlert, Database, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "Groceries",
    imageUrl: ""
  });

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      setIsAuthenticated(true);
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Incorrect administrative password.",
      });
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    const productsRef = collection(firestore, 'products');
    const newDocRef = doc(productsRef);
    
    const productData: Product = {
      id: newDocRef.id,
      name: newProduct.name,
      price: Number(newProduct.price),
      description: newProduct.description,
      category: newProduct.category,
      imageUrl: newProduct.imageUrl || "https://picsum.photos/seed/new/400/300"
    };

    setDocumentNonBlocking(newDocRef, productData, { merge: true });
    
    setIsAddDialogOpen(false);
    setNewProduct({
      name: "",
      price: "",
      description: "",
      category: "Groceries",
      imageUrl: ""
    });

    toast({
      title: "Product Added",
      description: `${productData.name} has been added to the catalog.`,
    });
  };

  const deleteProduct = (productId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'products', productId);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Product Deleted",
      description: "Item has been removed from catalog.",
    });
  };

  const seedDatabase = () => {
    if (!firestore) return;
    
    PlaceHolderImages.forEach((img) => {
      const docRef = doc(firestore, 'products', img.id);
      const productData: Product = {
        id: img.id,
        name: img.description,
        price: Math.floor(Math.random() * 100) + 20,
        description: `High quality ${img.description.toLowerCase()} sourced locally.`,
        imageUrl: img.imageUrl,
        category: 'Groceries'
      };
      setDocumentNonBlocking(docRef, productData, { merge: true });
    });

    toast({
      title: "Database Seeded",
      description: "Initial products have been added to the catalog.",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-2xl">Secure Admin Access</CardTitle>
            <CardDescription>Enter the administrative password to manage your shop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              type="password" 
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="h-12 text-center text-lg"
            />
            <Button onClick={handleLogin} className="w-full h-12 text-lg">
              Unlock Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-headline font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your products and pricing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={seedDatabase} className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Seed Database
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAddProduct}>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new product in your catalog.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input 
                        id="name" 
                        required 
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price (Rs.)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        required 
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Input 
                        id="category" 
                        required 
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        required 
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                      <Input 
                        id="imageUrl" 
                        placeholder="https://..."
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Product</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>Rs. {product.price}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!products || products.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No products found. Use "Seed Database" to add initial items or click "Add New Product".
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
