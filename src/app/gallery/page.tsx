"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import GalleryContainer from "@/components/gallery/gallery-container";
import Sidebar from "@/components/dashboard/sidebar";
import CollectionsCarousel from "@/components/collections/collections-carousel";
import { motion } from "framer-motion";

export default function GalleryPage() {
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // If still loading or not authenticated, show nothing
  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView="gallery" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {/* Page intro */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Photo Gallery
              </h2>
              <p className="text-muted-foreground mt-1">
                Browse your photos with AI-powered organization from AWS
                Rekognition
              </p>
            </div>

            {/* Collections carousel with active collection handling */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-8"
            >
              <CollectionsCarousel onCollectionSelect={setActiveCollection} />
            </motion.div>

            {/* Active collection indicator */}
            {activeCollection && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="text-sm text-muted-foreground">
                    Viewing collection:
                  </div>
                  <div className="ml-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {activeCollection
                      .replace(/-/g, " ")
                      .replace(/^(location|label|date)-/, "")}
                  </div>
                </div>
                <button
                  onClick={() => setActiveCollection(null)}
                  className="text-sm text-primary hover:underline"
                >
                  Clear filter
                </button>
              </motion.div>
            )}

            {/* Gallery with collection filter */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <GalleryContainer activeCollection={activeCollection} />
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
