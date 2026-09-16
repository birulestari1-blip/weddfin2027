import { useState, useCallback } from 'react';
import { portfolioService } from '../services/portfolio.service';
import type { PortfolioWithMedia } from '../types/portfolio.types';
import type { PortfolioFormInput, PortfolioMediaFormInput } from '../schemas/portfolio.schema';

export const usePortfolio = () => {
  const [portfolios, setPortfolios] = useState<PortfolioWithMedia[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = useCallback(async (limit: number = 50, offset: number = 0) => {
    setIsLoading(true);
    setError(null);
    const { data, count: totalCount, error: err } = await portfolioService.getPortfolios(limit, offset);
    setIsLoading(false);
    
    if (err) {
      setError(err.message);
      return;
    }
    
    setPortfolios((data as unknown as PortfolioWithMedia[]) || []);
    setCount(totalCount || 0);
  }, []);

  const createPortfolio = async (input: PortfolioFormInput) => {
    const res = await portfolioService.createPortfolio(input);
    if (res.success) fetchPortfolios();
    return res;
  };

  const updatePortfolio = async (id: string, input: Partial<PortfolioFormInput>) => {
    const res = await portfolioService.updatePortfolio(id, input);
    if (res.success) fetchPortfolios();
    return res;
  };

  const deletePortfolio = async (id: string) => {
    const res = await portfolioService.deletePortfolio(id);
    if (res.success) fetchPortfolios();
    return res;
  };

  const addMedia = async (portfolioId: string, input: PortfolioMediaFormInput) => {
    const res = await portfolioService.addMedia(portfolioId, input);
    if (res.success) fetchPortfolios();
    return res;
  };

  const deleteMedia = async (id: string) => {
    const res = await portfolioService.deleteMedia(id);
    if (res.success) fetchPortfolios();
    return res;
  };

  return {
    portfolios,
    count,
    isLoading,
    error,
    fetchPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    addMedia,
    deleteMedia,
  };
};
