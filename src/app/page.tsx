'use client';

import React, { useEffect, useState } from 'react';
import WheelSpinner from '@/components/WheelSpinner';
import CategorySelector from '@/components/CategorySelector';
import OptionsManager from '@/components/OptionsManager';
import HistoryLog from '@/components/HistoryLog';
import HeartsBackground from '@/components/HeartsBackground';
import { Sparkles, Trophy, X, Database, AlertCircle } from 'lucide-react';
import styles from './page.module.css';

interface WheelItem {
  id: string;
  name: string;
  color: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  items: WheelItem[];
}

interface HistoryItem {
  id: string;
  itemName: string;
  categoryName: string;
  spunAt: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [dbAvailable, setDbAvailable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Winner Overlay State
  const [winner, setWinner] = useState<WheelItem | null>(null);

  // Get or generate a unique client ID (for tracking this specific machine/browser)
  const getClientId = (): string => {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('spin_client_id');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('spin_client_id', id);
    }
    return id;
  };

  // Fetch initial data on mount
  useEffect(() => {
    async function initData() {
      try {
        const id = getClientId();
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();

        const histRes = await fetch(`/api/history?clientId=${id}`);
        const histData = await histRes.json();

        setDbAvailable(catData.dbAvailable);

        if (catData.dbAvailable) {
          setCategories(catData.categories);
          setHistory(histData.history || []);
          if (catData.categories.length > 0) {
            setActiveCategoryId(catData.categories[0].id);
          }
        } else {
          // DATABASE FALLBACK: Load from localStorage
          loadLocalStorageFallback(catData.categories);
        }
      } catch (err) {
        console.error("Initial data load failed, falling back to localStorage:", err);
        setDbAvailable(false);
        loadLocalStorageFallback();
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  const loadLocalStorageFallback = (serverDefaultCategories?: Category[]) => {
    if (typeof window === 'undefined') return;

    const savedCats = localStorage.getItem('spin_categories');
    const savedHist = localStorage.getItem('spin_history');

    let parsedCats: Category[] = [];
    if (savedCats) {
      try {
        parsedCats = JSON.parse(savedCats);
      } catch (e) {
        parsedCats = [];
      }
    }

    if (parsedCats.length === 0) {
      // Use standard default mock categories
      parsedCats = serverDefaultCategories || [];
      localStorage.setItem('spin_categories', JSON.stringify(parsedCats));
    }

    setCategories(parsedCats);
    if (parsedCats.length > 0) {
      setActiveCategoryId(parsedCats[0].id);
    }

    if (savedHist) {
      try {
        setHistory(JSON.parse(savedHist));
      } catch (e) {
        setHistory([]);
      }
    }
  };

  const getActiveCategory = (): Category | undefined => {
    return categories.find(c => c.id === activeCategoryId);
  };

  const getActiveItems = (): WheelItem[] => {
    const activeCat = getActiveCategory();
    return activeCat ? activeCat.items : [];
  };

  // Category Actions
  const handleCreateCategory = async (name: string) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (res.ok) {
        if (dbAvailable) {
          setCategories(prev => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
          setActiveCategoryId(data.category.id);
        } else {
          // LocalStorage fallback
          const newCat: Category = {
            id: `local-category-${Date.now()}`,
            name: name.trim(),
            items: []
          };
          const updated = [...categories, newCat].sort((a, b) => a.name.localeCompare(b.name));
          setCategories(updated);
          localStorage.setItem('spin_categories', JSON.stringify(updated));
          setActiveCategoryId(newCat.id);
        }
      } else {
        alert(data.error || 'Lỗi khi tạo danh mục');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (categories.length <= 1) {
      alert("Bạn phải giữ lại ít nhất một danh mục vòng quay!");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này cùng toàn bộ các lựa chọn bên trong?")) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        let updated: Category[] = [];
        if (dbAvailable) {
          updated = categories.filter(c => c.id !== id);
        } else {
          // LocalStorage fallback
          updated = categories.filter(c => c.id !== id);
          localStorage.setItem('spin_categories', JSON.stringify(updated));
        }

        setCategories(updated);
        // Reset active category if deleted
        if (activeCategoryId === id && updated.length > 0) {
          setActiveCategoryId(updated[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Option / Item Actions
  const handleAddItem = async (name: string, color: string) => {
    if (!activeCategoryId) return;

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, categoryId: activeCategoryId }),
      });
      const data = await res.json();

      if (res.ok) {
        if (dbAvailable) {
          setCategories(prev => prev.map(cat => {
            if (cat.id === activeCategoryId) {
              return { ...cat, items: [...cat.items, data.item] };
            }
            return cat;
          }));
        } else {
          // LocalStorage fallback
          const newItem: WheelItem = {
            id: `local-item-${Date.now()}`,
            name: name.trim(),
            color,
            categoryId: activeCategoryId
          };
          const updated = categories.map(cat => {
            if (cat.id === activeCategoryId) {
              return { ...cat, items: [...cat.items, newItem] };
            }
            return cat;
          });
          setCategories(updated);
          localStorage.setItem('spin_categories', JSON.stringify(updated));
        }
      } else {
        alert(data.error || 'Lỗi khi thêm lựa chọn');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        if (dbAvailable) {
          setCategories(prev => prev.map(cat => {
            if (cat.id === activeCategoryId) {
              return { ...cat, items: cat.items.filter(item => item.id !== itemId) };
            }
            return cat;
          }));
        } else {
          // LocalStorage fallback
          const updated = categories.map(cat => {
            if (cat.id === activeCategoryId) {
              return { ...cat, items: cat.items.filter(item => item.id !== itemId) };
            }
            return cat;
          });
          setCategories(updated);
          localStorage.setItem('spin_categories', JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Spin Actions
  const handleSpinComplete = async (winningItem: WheelItem) => {
    const activeCat = getActiveCategory();
    const categoryName = activeCat ? activeCat.name : 'Vòng quay';

    setWinner(winningItem);

    try {
      const id = getClientId();
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: winningItem.name,
          categoryName,
          clientId: id,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        if (dbAvailable) {
          setHistory(prev => [data.historyItem, ...prev].slice(0, 20));
        } else {
          // LocalStorage fallback
          const localHistoryItem: HistoryItem = {
            id: `local-history-${Date.now()}`,
            itemName: winningItem.name,
            categoryName,
            spunAt: new Date().toISOString()
          };
          const updatedHist = [localHistoryItem, ...history].slice(0, 20);
          setHistory(updatedHist);
          localStorage.setItem('spin_history', JSON.stringify(updatedHist));
        }
      }
    } catch (e) {
      console.error("Failed to log history to server:", e);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Bạn có muốn xóa toàn bộ lịch sử quay thưởng không?")) return;

    try {
      const id = getClientId();
      const res = await fetch(`/api/history?clientId=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
        if (!dbAvailable) {
          localStorage.removeItem('spin_history');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Đang tải tài nguyên...</p>
      </div>
    );
  }

  const activeItems = getActiveItems();
  const activeCategory = getActiveCategory();

  return (
    <main className={styles.main}>
      <HeartsBackground />
      {/* Background blobs for premium glassmorphism glow */}
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>
      <div className={styles.blob3}></div>

      {/* Header section */}
      <header className={styles.header}>
        <div className={styles.logoWrapper}>
          <Sparkles className={styles.logoIcon} />
          <h1 className={styles.title}>Vòng Quay Lựa Chọn</h1>
        </div>
        <p className={styles.subtitle}>
          Lựa chọn ăn uống, vui chơi, địa điểm... Trợ thủ đắc lực giải quyết câu hỏi "Hôm nay đi đâu?"
        </p>

        {/* Database Status Alert */}
        <div className={`${styles.statusAlert} ${dbAvailable ? styles.statusOnline : styles.statusOffline}`}>
          {dbAvailable ? (
            <>
              <Database className={styles.statusIcon} />
              <span>Đang kết nối: Neon PostgreSQL Cloud Database</span>
            </>
          ) : (
            <>
              <AlertCircle className={styles.statusIcon} />
              <span>Offline Mode (Lưu trữ cục bộ trên trình duyệt)</span>
            </>
          )}
        </div>
      </header>

      {/* Main dashboard grid layout */}
      <div className={styles.gridContainer}>
        {/* Left Column: Category management */}
        <section className={styles.leftColumn}>
          <CategorySelector
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
            onCreateCategory={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
          <OptionsManager
            items={activeItems}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            isSpinning={isSpinning}
          />
        </section>

        {/* Center Column: Wheel spinner */}
        <section className={styles.centerColumn}>
          <div className={styles.spinnerCard}>
            <h2 className={styles.activeCategoryTitle}>
              {activeCategory ? activeCategory.name : 'Chọn danh mục'}
            </h2>
            <WheelSpinner
              items={activeItems}
              onSpinComplete={handleSpinComplete}
            />
          </div>
        </section>

        {/* Right Column: History list */}
        <section className={styles.rightColumn}>
          <HistoryLog
            history={history}
            onClearHistory={handleClearHistory}
          />
        </section>
      </div>

      {/* WINNER OVERLAY MODAL */}
      {winner && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {/* Confetti effect inside modal */}
            <div className={styles.modalGlow} style={{ backgroundColor: winner.color }}></div>

            <button
              onClick={() => setWinner(null)}
              className={styles.modalCloseButton}
              aria-label="Đóng kết quả"
            >
              <X className={styles.modalCloseIcon} />
            </button>

            <Trophy className={styles.trophyIcon} />
            <h2 className={styles.congratsText}>Chúc Mừng!</h2>
            <p className={styles.modalCategoryText}>
              Kết quả trong nhóm <strong>{activeCategory?.name}</strong>:
            </p>

            <div className={styles.winnerCardDetail} style={{ borderColor: winner.color }}>
              <span className={styles.winnerItemName}>{winner.name}</span>
            </div>

            <button
              onClick={() => setWinner(null)}
              className={styles.modalPrimaryButton}
            >
              Tuyệt Vời!
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
