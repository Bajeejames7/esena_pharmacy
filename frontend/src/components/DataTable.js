import React, { useState } from 'react';
import { useBreakpoint } from '../utils/responsive';
import GlassCard from './GlassCard';
import GlassButton from './forms/GlassButton';

/**
 * Responsive data table component for admin dashboard
 * Implements Requirements 17.8, 17.9
 */
const DataTable = ({ 
  data = [], 
  columns = [], 
  loading = false, 
  error = null,
  onSort,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 20,
  totalItems = 0,
  actions = [],
  emptyMessage = "No data available"
}) => {
  const { breakpoint } = useBreakpoint();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const isMobile = breakpoint === 'mobile';

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    if (onSort) {
      onSort(key, direction);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg bg-white/20 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          {!isMobile && startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange && onPageChange(1)}
                className="px-3 py-1 rounded-lg bg-white/20 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-slate-600/50 transition-colors"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-400 dark:text-gray-500">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange && onPageChange(page)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-blue-500 dark:bg-blue-600 text-white'
                  : 'bg-white/20 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-slate-600/50'
              }`}
            >
              {page}
            </button>
          ))}
          
          {!isMobile && endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-400 dark:text-gray-500">...</span>}
              <button
                onClick={() => onPageChange && onPageChange(totalPages)}
                className="px-3 py-1 rounded-lg bg-white/20 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-slate-600/50 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg bg-white/20 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <GlassCard className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading...</span>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-8">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 dark:text-red-400 font-medium mb-2">Error Loading Data</p>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </GlassCard>
    );
  }

  if (data.length === 0) {
    return (
      <GlassCard className="p-8">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-300">{emptyMessage}</p>
        </div>
      </GlassCard>
    );
  }

  // Mobile card layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((row, index) => (
          <GlassCard key={index} className="p-4">
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{column.label}:</span>
                  <span className="text-sm text-gray-800 dark:text-gray-100 text-right">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </span>
                </div>
              ))}
              
              {actions.length > 0 && (
                <div className="flex space-x-2 pt-3 border-t border-white/20">
                  {actions.map((action, actionIndex) => (
                    <GlassButton
                      key={actionIndex}
                      variant={action.variant || 'secondary'}
                      size="sm"
                      onClick={() => action.onClick(row)}
                      disabled={action.disabled && action.disabled(row)}
                    >
                      {action.label}
                    </GlassButton>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        ))}
        
        {renderPagination()}
      </div>
    );
  }

  // Desktop table layout
  return (
    <GlassCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20 dark:border-slate-600/30">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200 ${
                    column.sortable ? 'cursor-pointer hover:text-gray-900 dark:hover:text-gray-100' : ''
                  }`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-b border-white/10 dark:border-slate-600/20 hover:bg-white/5 dark:hover:bg-slate-700/20 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {actions.map((action, actionIndex) => (
                        <GlassButton
                          key={actionIndex}
                          variant={action.variant || 'secondary'}
                          size="sm"
                          onClick={() => action.onClick(row)}
                          disabled={action.disabled && action.disabled(row)}
                        >
                          {action.label}
                        </GlassButton>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {renderPagination()}
    </GlassCard>
  );
};

export default DataTable;