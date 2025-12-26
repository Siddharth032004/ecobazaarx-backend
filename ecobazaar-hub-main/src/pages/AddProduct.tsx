import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { productService, categoryService, brandService } from "@/services/api";
import { EcoImpactInputs, EcoInputsData } from "@/components/EcoImpactInputs";

const AddProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState<string>("");

    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        brand: "",
        city: "",
        state: "",
        images: "",
        eco_inputs: {
            materials: [],
            manufacturing: [],
            packaging: []
        } as EcoInputsData
    });

    const FIXED_CATEGORIES = [
        "Eco-Friendly Groceries",
        "Personal Care (Eco-Friendly)",
        "Eco Kitchenware",
        "Green Electronics",
        "Eco-Home & Living",
        "Sustainable Fashion"
    ];



    useEffect(() => {
        checkAuth();
        if (id) {
            fetchProductDetails(id);
        }
    }, [id]);

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/auth");
            return;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserRole(payload.role);
        } catch (e) {
            navigate("/auth");
        }
    };

    const fetchProductDetails = async (productId: string) => {
        setLoading(true);
        try {
            const product = await productService.getById(productId);
            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description || "",
                    price: String(product.price),
                    stock: String(product.stockQuantity),
                    category: product.categoryName || "",
                    brand: product.brand || "",
                    city: product.city || "",
                    state: product.state || "",
                    images: product.images ? product.images.join(", ") : "",
                    // If ecoInputs are not returned by backend, we leave them empty.
                    // This is SAFE because backend will NOT recalculate/wipe footprint if inputs are empty.
                    eco_inputs: (product as any).ecoInputs || { materials: [], manufacturing: [], packaging: [] }
                });
            }
        } catch (error) {
            toast.error("Failed to fetch product details");
            navigate("/admin");
        } finally {
            setLoading(false);
        }
    };

    const cleanNumber = (val: string) => {
        if (val === '') return '';
        const noLeadingZeros = val.replace(/^0+/, '');
        if (noLeadingZeros === '') return '0';
        if (noLeadingZeros.startsWith('.')) return '0' + noLeadingZeros;
        return noLeadingZeros;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Negative Values
        if (Number(formData.price) < 0) {
            toast.error("Price cannot be negative");
            return;
        }
        if (Number(formData.stock) < 0) {
            toast.error("Stock Quantity cannot be negative");
            return;
        }

        try {
            const productData = {
                name: formData.name,
                slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
                description: formData.description,
                price: parseFloat(formData.price),
                stockQuantity: parseInt(formData.stock),
                ecoInputs: formData.eco_inputs,
                categoryName: formData.category,
                brand: formData.brand,
                city: formData.city,
                state: formData.state,
                images: formData.images ? formData.images.split(",").map((url: string) => url.trim()) : [],
            };

            if (isEditMode && id) {
                await productService.update(id, productData);
                toast.success("Product updated successfully!");
            } else {
                await productService.create(productData);
                toast.success("Product created successfully!");
            }

            navigate("/admin");
        } catch (error: any) {
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{isEditMode ? 'Edit Product' : 'Add New Product'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price (₹) *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: cleanNumber(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Stock Quantity *</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            min="0"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: cleanNumber(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FIXED_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brand">Brand Name</Label>
                                        <Input
                                            id="brand"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            placeholder="Enter brand name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="images">Image URLs (comma separated)</Label>
                                    <Input
                                        id="images"
                                        value={formData.images}
                                        onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City / District *</Label>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="Enter city or district"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State *</Label>
                                        <Input
                                            id="state"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            placeholder="Enter state"
                                            required
                                        />
                                    </div>
                                </div>



                                {/* Eco Impact Section */}
                                <EcoImpactInputs
                                    value={formData.eco_inputs}
                                    onChange={(val) => setFormData({ ...formData, eco_inputs: val })}
                                />

                                <div className="flex justify-end gap-4 pt-4">
                                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">{isEditMode ? 'Update Product' : 'Create Product'}</Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddProduct;
