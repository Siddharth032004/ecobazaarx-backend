import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Import images
import groceriesImg from '@/assets/categories/groceries.jpg';
import careImg from '@/assets/categories/care.jpg.png';
import kitchenImg from '@/assets/categories/kitchen.jpg';
import electronicsImg from '@/assets/categories/electronics.jpg';
import homeImg from '@/assets/categories/home.jpg';
import fashionImg from '@/assets/categories/fashion.jpg';

const categories = [
    { id: 1, title: 'Eco-Friendly Groceries', image: groceriesImg },
    { id: 2, title: 'Personal Care (Eco-Friendly)', image: careImg },
    { id: 3, title: 'Eco Kitchenware', image: kitchenImg },
    { id: 4, title: 'Green Electronics', image: electronicsImg },
    { id: 5, title: 'Eco-Home & Living', image: homeImg },
    { id: 6, title: 'Sustainable Fashion', image: fashionImg },
];

const PopularCategories = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleCategoryClick = (title: string) => {
        toast.info(`Products for ${title} are not available yet.`);
    };

    return (
        <section
            ref={sectionRef}
            className={`py-12 px-4 bg-secondary/5 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
            <div className="container mx-auto">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-secondary mb-2">Popular Categories</h2>
                    <p className="text-muted-foreground">Discover eco-friendly picks across every part of your life.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            onClick={() => handleCategoryClick(category.title)}
                            className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-64"
                        >
                            <img
                                src={category.image}
                                alt={category.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                                <h3 className="text-white text-xl font-semibold transform transition-transform duration-300 group-hover:-translate-y-1">
                                    {category.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PopularCategories;
