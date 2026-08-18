export type NavLink = { title: string; href: string; children?: NavLink[] };

export const mainMenu: NavLink[] = [
  { title: "Home", href: "/" },
  { title: "Catalog", href: "/category/all" },
  {
    title: "T-Shirts",
    href: "/category/t-shirts",
    children: [
      { title: "CHR0M3 H34RTS T-shirt", href: "/category/chr0m3-h34rts-t-shirt" },
      { title: "B4P3 T-shirt", href: "/category/b4p3-tee" },
      { title: "3ssentials T-shirt", href: "/category/3ssentials-t-shirt-collection" },
    ],
  },
  { title: "Shorts", href: "/category/shorts-collection" },
  {
    title: "Hoodies/Sweatshirts",
    href: "/category/hoodies",
    children: [
      { title: "B4P3 Hoodies and Sweatshirts", href: "/category/b4p3-hoodies" },
      { title: "3ssentials Hoodies and Sweatshirts", href: "/category/essentials-hoodies-and-sweatshirts" },
    ],
  },
  { title: "Jeans", href: "/category/jeans-collection" },
  { title: "Pants", href: "/category/pants-collectoin" },
  { title: "Perfumes", href: "/category/luxury-perfumes" },
];

export const footerShopMenu: NavLink[] = [
  { title: "T-Shirts", href: "/category/t-shirts" },
  { title: "Hoodies", href: "/category/hoodies" },
  { title: "Jackets", href: "/category/jackets" },
  { title: "Sneakers", href: "/category/sneakers" },
  { title: "Accessories", href: "/category/accessories" },
  { title: "Luxury Perfumes", href: "/category/luxury-perfumes" },
];

export const footerHelpMenu: NavLink[] = [
  { title: "Search", href: "/search" },
  { title: "Contact", href: "/pages/contact" },
  { title: "Privacy Policy", href: "/policies/privacy-policy" },
];
