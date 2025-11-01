// contexts/CategoriesContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { categoryService, Category, CreateCategoryData, UpdateCategoryData, CategoryLimit } from '@/services/categoryService';
import { premiumService, PremiumStatus } from '@/services/premiumService';

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  limit: CategoryLimit;
  premiumStatus: PremiumStatus;
  actions: {
    createCategory: (data: CreateCategoryData) => Promise<Category>;
    updateCategory: (id: number, data: UpdateCategoryData) => Promise<Category>;
    deleteCategory: (id: number) => Promise<void>;
    refresh: () => Promise<void>;
    clearError: () => void;
  };
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<CategoryLimit>({ current: 0, limit: 6, isPremium: false });
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({ 
    hasActivePremium: false, 
    hadPremiumBefore: false 
  });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriesData, limitData, premiumData] = await Promise.all([
        categoryService.getCategories(),
        categoryService.checkCategoryLimit(),
        premiumService.checkPremiumStatus()
      ]);
      
      setCategories(categoriesData);
      setLimit(limitData);
      setPremiumStatus({
        hasActivePremium: premiumData.hasActivePremium,
        hadPremiumBefore: premiumData.hadPremiumBefore
      });
      
    } catch (err: any) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData: CreateCategoryData): Promise<Category> => {
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      
      // Обновляем локальное состояние
      setCategories(prev => [...prev, newCategory]);
      setLimit(prev => ({ ...prev, current: prev.current + 1 }));
      
      return newCategory;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateCategory = useCallback(async (categoryId: number, updateData: UpdateCategoryData): Promise<Category> => {
    try {
      const updatedCategory = await categoryService.updateCategory(categoryId, updateData);
      
      // Обновляем локальное состояние
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? updatedCategory : cat
      ));
      
      return updatedCategory;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: number): Promise<void> => {
    try {
      await categoryService.deleteCategory(categoryId);
      
      // Обновляем локальное состояние
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setLimit(prev => ({ ...prev, current: Math.max(0, prev.current - 1) }));
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Загружаем категории при монтировании
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const value = {
    categories,
    loading,
    error,
    limit,
    premiumStatus,
    actions: {
      createCategory,
      updateCategory,
      deleteCategory,
      refresh: loadCategories,
      clearError
    }
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};