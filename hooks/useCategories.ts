// hooks/useCategories.ts
import { useState, useCallback, useEffect } from 'react';
import { categoryService, Category, CreateCategoryData, UpdateCategoryData, CategoryLimit } from '@/services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<CategoryLimit>({ current: 0, limit: 6, isPremium: false });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriesData, limitData] = await Promise.all([
        categoryService.getCategories(),
        categoryService.checkCategoryLimit()
      ]);
      
      setCategories(categoriesData);
      setLimit(limitData);
      
    } catch (err: any) {
      setError(err.message);
      // В случае ошибки все равно устанавливаем пустой массив
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

  return {
    categories,
    loading,
    error,
    limit,
    actions: {
      createCategory,
      updateCategory,
      deleteCategory,
      refresh: loadCategories,
      clearError
    }
  };
};