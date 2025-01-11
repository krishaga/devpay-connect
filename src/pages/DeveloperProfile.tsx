import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { DeveloperCard } from "@/components/DeveloperCard";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@supabase/supabase-js";


interface Developer {
  id: string;
  name: string;
  hourly_rate: number;
  skills: string[];
  available: boolean;
  image_url: string;
}

const DeveloperProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [developers, setDevelopers] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDevelopers();
  }, []);
  

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('developers')
        .select('*')
        .neq('status', 'busy')
        .neq('status', 'offline');

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%, skills.cs.{${searchQuery}}`);
      }

      if (priceRange) {
        switch (priceRange) {
          case "low":
            query = query.lt('hourly_rate', 0.3);
            break;
          case "medium":
            query = query.gte('hourly_rate', 0.3).lt('hourly_rate', 0.6);
            break;
          case "high":
            query = query.gte('hourly_rate', 0.6);
            break;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching developers:', error);
        //@ts-ignore
        toast.error("Error fetching developers: " + error.message);
        return;
      }

      if (data) {
        console.log(data)
        //@ts-ignore
        setDevelopers(data as Developer[]);
      }
    } catch (error: any) {
      console.error('Error in fetchDevelopers:', error);
      //@ts-ignore
      toast.error("Error fetching developers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDevelopers();
  };

  const handlePriceRangeChange = (value: string) => {
    setPriceRange(value);
    fetchDevelopers();
  };


  // const handleBooking = async () => {
  //   const { data: { session } } = await supabase.auth.getSession();
    
  //   if (!session) {
  //     navigate("/login");
  //     return;
  //   }

  //   const { error } = await supabase
  //     .from("bookings")
  //     .insert({
  //       client_id: session.user.id,
  //       developer_id: id,
  //       amount: developer.hourly_rate,
  //     });

  //   if (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to create booking",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   toast({
  //     title: "Success",
  //     description: "Booking created successfully",
  //   });
  //   setIsBookingOpen(false);
  // };

  // if (!developer) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Available Developers</h1>
          <p className="text-lg text-muted-foreground">
            Find and connect with expert developers instantly
          </p>
        </div>

        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9" 
                placeholder="Search by name or skills..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <Select value={priceRange} onValueChange={handlePriceRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Under 0.3 ETH/hour</SelectItem>
                <SelectItem value="medium">0.3 - 0.6 ETH/hour</SelectItem>
                <SelectItem value="high">Over 0.6 ETH/hour</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleSearch}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-full text-center text-lg text-muted-foreground">
              Loading developers...
            </p>
          ) : developers.length === 0 ? (
            <p className="col-span-full text-center text-lg text-muted-foreground">
              No developers found matching your criteria.
            </p>
          ) : (
            developers.map((dev) => (
              <DeveloperCard
                key={dev.id}
                name={dev.name}
                hourlyRate={dev.hourly_rate}
                skills={dev.skills}
                available={dev.status}
                imageUrl={dev.image_url}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfile;