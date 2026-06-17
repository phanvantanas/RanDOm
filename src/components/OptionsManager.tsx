'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ListPlus } from 'lucide-react';
import styles from './OptionsManager.module.css';

interface WheelItem {
  id: string;
  name: string;
  color: string;
}

interface OptionsManagerProps {
  items: WheelItem[];
  onAddItem: (name: string, color: string) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  isSpinning: boolean;
}

export default function OptionsManager({
  items,
  onAddItem,
  onDeleteItem,
  isSpinning,
}: OptionsManagerProps) {
  const [newItemName, setNewItemName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate distinct HSL colors using the golden ratio hue distribution
  const generateGoldenRatioColor = () => {
    const hue = (items.length * 137.5) % 360;
    return `hsl(${hue.toFixed(0)}, 75%, 55%)`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || isSpinning) return;

    setIsSubmitting(true);
    try {
      const color = generateGoldenRatioColor();
      await onAddItem(newItemName, color);
      setNewItemName('');
    } catch (error) {
      console.error("Failed to add option:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <ListPlus className={styles.icon} />
        <span>Danh sách lựa chọn</span>
      </h3>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.addForm}>
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Thêm lựa chọn mới..."
          disabled={isSubmitting || isSpinning}
          maxLength={30}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={isSubmitting || isSpinning || !newItemName.trim()}
          className={styles.addButton}
          aria-label="Add item"
        >
          <Plus className={styles.addIcon} />
        </button>
      </form>

      {/* Items List */}
      <div className={styles.itemsList}>
        {items.length === 0 ? (
          <p className={styles.emptyText}>Chưa có lựa chọn nào. Hãy thêm ít nhất 2 mục!</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className={styles.itemRow}>
              <div className={styles.itemLabel}>
                {/* Color Dot */}
                <span
                  className={styles.colorIndicator}
                  style={{ backgroundColor: item.color }}
                />
                <span className={styles.itemName}>{item.name}</span>
              </div>

              <button
                type="button"
                onClick={() => onDeleteItem(item.id)}
                disabled={isSpinning || items.length <= 2} // maintain at least 2 items for a valid spinner
                className={styles.deleteButton}
                title={items.length <= 2 ? "Cần tối thiểu 2 lựa chọn để quay" : "Xóa lựa chọn"}
                aria-label={`Delete option ${item.name}`}
              >
                <Trash2 className={styles.deleteIcon} />
              </button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && items.length <= 2 && (
        <p className={styles.tipText}>💡 Cần tối thiểu 2 lựa chọn để có thể quay thưởng!</p>
      )}
    </div>
  );
}
