import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { leaderboardService, LeaderboardEntry } from "@/services/api";
import { Trophy, Leaf, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function Leaderboard() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const data = await leaderboardService.getTopSavers();
            setEntries(data || []);
        } catch (error) {
            toast.error("Failed to load leaderboard");
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 1:
                return <Trophy className="h-6 w-6 text-gray-400" />;
            case 2:
                return <Trophy className="h-6 w-6 text-amber-600" />;
            default:
                return <span className="font-bold text-muted-foreground w-6 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-secondary mb-2 flex items-center justify-center gap-2">
                        <Leaf className="h-10 w-10 text-eco-green" />
                        Carbon Leaderboard
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Top Eco-Savers of the Month. Join the movement!
                    </p>
                </div>

                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>Top Eco-Savers</CardTitle>
                        <CardDescription>
                            Rankings based on total CO₂ saved from confirmed eco-friendly purchases this month.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="p-8 text-center">Loading...</div>
                        ) : entries.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <Leaf className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p className="text-lg">No eco-savers yet this month.</p>
                                <p>Be the first to make a climate-positive purchase!</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px] text-center">Rank</TableHead>
                                        <TableHead>Eco-Saver</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead className="text-right">Eco Purchases</TableHead>
                                        <TableHead className="text-right">Carbon Points</TableHead>
                                        <TableHead className="text-right">CO₂ Saved</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entries.map((entry, index) => (
                                        <TableRow key={entry.userId} className={index < 3 ? "bg-muted/30" : ""}>
                                            <TableCell className="font-medium flex justify-center items-center h-12">
                                                {getRankIcon(index)}
                                            </TableCell>
                                            <TableCell className="font-medium text-secondary">
                                                {entry.customerName}
                                            </TableCell>
                                            <TableCell className="text-sm text-emerald-600 font-medium">
                                                {entry.currentLevel || 'Eco Starter'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <span className="font-semibold">{entry.ecoOrdersCount}</span>
                                                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-bold text-yellow-600">
                                                    {entry.totalCarbonPoints?.toFixed(0) || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-lg font-bold text-eco-green">
                                                    {entry.totalCarbonSavedKg.toFixed(1)} kg
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
