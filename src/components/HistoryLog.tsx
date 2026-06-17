'use client';

import React from 'react';
import { History, Trash2 } from 'lucide-react';
import styles from './HistoryLog.module.css';

interface HistoryItem {
  id: string;
  itemName: string;
  categoryName: string;
  spunAt: string;
}

interface HistoryLogProps {
  history: HistoryItem[];
  onClearHistory: () => Promise<void>;
}

export default function HistoryLog({ history, onClearHistory }: HistoryLogProps) {
  // Simple time formatter (HH:MM:SS)
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <History className={styles.icon} />
          <span>Lịch sử quay</span>
        </h3>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className={styles.clearButton}
            title="Xóa toàn bộ lịch sử"
            aria-label="Clear history"
          >
            <Trash2 className={styles.clearIcon} />
            <span>Xóa</span>
          </button>
        )}
      </div>

      <div className={styles.logList}>
        {history.length === 0 ? (
          <p className={styles.emptyText}>Chưa có lịch sử quay thưởng.</p>
        ) : (
          history.map((item) => (
            <div key={item.id} className={styles.logRow}>
              <div className={styles.leftInfo}>
                <span className={styles.winnerName}>{item.itemName}</span>
                <span className={styles.categoryBadge}>{item.categoryName}</span>
              </div>
              <span className={styles.timestamp}>{formatTime(item.spunAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
