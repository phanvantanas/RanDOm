'use client';

import React, { useState } from 'react';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import styles from './CategorySelector.module.css';

interface Category {
  id: string;
  name: string;
}

interface CategorySelectorProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  onCreateCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export default function CategorySelector({
  categories,
  activeCategoryId,
  onSelectCategory,
  onCreateCategory,
  onDeleteCategory,
}: CategorySelectorProps) {
  const [newCatName, setNewCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateCategory(newCatName);
      setNewCatName('');
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <FolderOpen className={styles.icon} />
        <span>Danh mục vòng quay</span>
      </h3>

      {/* Tabs list */}
      <div className={styles.tabsList}>
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          // Protect mock categories from deletion in UI just to keep it clean, but allow deletion of everything
          const isMock = cat.id.startsWith('mock-category-');

          return (
            <div
              key={cat.id}
              className={`${styles.tabWrapper} ${isActive ? styles.activeTab : ''}`}
            >
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={styles.tabButton}
              >
                {cat.name}
              </button>

              <button
                type="button"
                onClick={() => onDeleteCategory(cat.id)}
                className={styles.deleteButton}
                title="Xóa danh mục này"
                aria-label={`Delete ${cat.name}`}
              >
                <Trash2 className={styles.deleteIcon} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add new category form */}
      <form onSubmit={handleSubmit} className={styles.addForm}>
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="Tạo danh mục mới..."
          disabled={isSubmitting}
          maxLength={20}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newCatName.trim()}
          className={styles.addButton}
          aria-label="Add category"
        >
          <Plus className={styles.addIcon} />
        </button>
      </form>
    </div>
  );
}
