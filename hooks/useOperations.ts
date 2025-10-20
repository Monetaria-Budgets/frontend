// hooks/useOperations.ts
import { useState, useCallback } from 'react';
import { operationService, Operation, OperationType } from '@/services/operationService';

interface OperationsStats {
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  allOperations: Operation[];
  currentMonthOperations: Operation[];
}

export const useOperations = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OperationsStats>({
    totalBalance: 0,
    currentMonthIncome: 0,
    currentMonthExpense: 0,
    allOperations: [],
    currentMonthOperations: []
  });

  const loadOperations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Загружаем все операции
      const allOperations = await operationService.getUserOperations();
      
      // Получаем начало и конец текущего месяца
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      // Загружаем операции за текущий месяц
      const currentMonthOperations = await operationService.getUserOperations({
        startDate,
        endDate
      });

      // Вычисляем статистику
      const totalBalance = allOperations.reduce((total, op) => {
        return op.operation === 'income' ? total + op.amount : total - op.amount;
      }, 0);

      const currentMonthIncome = currentMonthOperations
        .filter((op): op is Operation & { operation: 'income' } => op.operation === 'income')
        .reduce((sum, op) => sum + op.amount, 0);

      const currentMonthExpense = currentMonthOperations
        .filter((op): op is Operation & { operation: 'expense' } => op.operation === 'expense')
        .reduce((sum, op) => sum + op.amount, 0);

      setStats({
        totalBalance,
        currentMonthIncome,
        currentMonthExpense,
        allOperations,
        currentMonthOperations
      });

    } catch (error) {
      console.error('Error loading operations:', error);
      setStats({
        totalBalance: 0,
        currentMonthIncome: 0,
        currentMonthExpense: 0,
        allOperations: [],
        currentMonthOperations: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    stats,
    loadOperations
  };
};