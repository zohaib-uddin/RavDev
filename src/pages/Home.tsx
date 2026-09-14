import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  HeroBanner,
  CategoryCards,
  CollectionsInFocus,
  ProductGrid,
  JournalSection,
  ReviewsCarousel,
  FAQSection,
  NewsletterSection,
} from '../components/home';

export default function Home() {
  const { products, reviews, fetchProducts, fetchCategories } = useStore();
  const [journalEntries, setJournalEntries] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // Fetch journal entries and FAQs from API
    fetchJournalEntries();
    fetchFAQs();
  }, []);

  const fetchJournalEntries = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/journal');
      const data = await response.json();
      setJournalEntries(data);
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/faqs');
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    }
  };

  return (
    <div>
      <HeroBanner />
      <CategoryCards />
      <CollectionsInFocus />
      
      <ProductGrid
        title="NEW ARRIVALS"
        subtitle="JUST DROPPED"
        filterFn={(p) => p.isNew}
        link="/shop?filter=new"
      />

      <ProductGrid
        title="BESTSELLERS"
        subtitle="TOP SELLERS"
        filterFn={(p) => p.isBestseller}
        link="/shop?filter=bestseller"
      />

      <ProductGrid
        title="FEATURED"
        subtitle="CURATED SELECTION"
        filterFn={(p) => p.isFeatured}
        link="/shop?filter=featured"
      />

      <JournalSection entries={journalEntries} />
      <ReviewsCarousel reviews={reviews} />
      <FAQSection faqs={faqs} />
      <NewsletterSection />
    </div>
  );
}
