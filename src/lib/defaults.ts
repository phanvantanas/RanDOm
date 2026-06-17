export interface DefaultItem {
  name: string;
  color: string;
}

export interface DefaultCategory {
  name: string;
  items: DefaultItem[];
}

export const defaultCategories: DefaultCategory[] = [
  {
    name: "Thức ăn",
    items: [
      { name: "Phở bò", color: "#FF5733" },
      { name: "Bánh mì", color: "#33FF57" },
      { name: "Bún chả", color: "#3357FF" },
      { name: "Sushi", color: "#F3FF33" },
      { name: "Pizza", color: "#FF33F3" },
      { name: "KFC", color: "#33FFF3" },
      { name: "Cơm tấm", color: "#FFA833" },
      { name: "Lẩu thái", color: "#A833FF" }
    ]
  },
  {
    name: "Đồ uống",
    items: [
      { name: "Cà phê sữa", color: "#5D4037" },
      { name: "Trà đào", color: "#FFB74D" },
      { name: "Trà sữa", color: "#FFE0B2" },
      { name: "Nước mía", color: "#C5E1A5" },
      { name: "Sinh tố bơ", color: "#9CCC65" },
      { name: "Bia", color: "#FFD54F" },
      { name: "Coca Cola", color: "#E53935" },
      { name: "Nước dừa", color: "#E0F7FA" }
    ]
  },
  {
    name: "Địa điểm",
    items: [
      { name: "Hồ Tây", color: "#4FC3F7" },
      { name: "Phố Cổ", color: "#FF8A65" },
      { name: "TT Thương Mại", color: "#BA68C8" },
      { name: "Rạp chiếu phim", color: "#4DB6AC" },
      { name: "Quán cà phê", color: "#A1887F" },
      { name: "Công viên", color: "#81C784" },
      { name: "Phố đi bộ", color: "#D4E157" },
      { name: "Nhà sách", color: "#AED581" }
    ]
  }
];
