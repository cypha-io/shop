'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart } from 'react-icons/fi';

type ProductCardItem = {
  id: number | string;
  name: string;
  price: string;
  regularPrice?: string | null;
  salePrice?: string | null;
  stock?: number | null;
  hasVariations?: boolean;
  variations?: Array<{
    name: string;
    option: string;
    regularPrice?: string | null;
    salePrice?: string | null;
  }> | null;
  image: string;
  category?: string;
};

type ProductCardProps = {
  product: ProductCardItem;
  href?: string;
  size?: 'default' | 'compact';
  showCategory?: boolean;
  showViewLabel?: boolean;
};

export default function ProductCard({
  product,
  href,
  size = 'default',
  showCategory = true,
  showViewLabel = true,
}: ProductCardProps) {
  const formatCedi = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return 'GH₵0';
    if (normalized.includes('₵') || normalized.toUpperCase().startsWith('GH')) return normalized;
    return `GH₵${normalized}`;
  };

  const cardHref = href ?? `/products/${product.id}`;
  const isCompact = size === 'compact';
  const normalizedRegularPrice = product.regularPrice?.trim() || '';
  const normalizedSalePrice = product.salePrice?.trim() || '';
  const isSoldOut = product.stock !== undefined && product.stock !== null && product.stock <= 0;

  // Extract min/max prices from variations if they exist
  const getVariationPrices = () => {
    if (!product.hasVariations || !Array.isArray(product.variations) || product.variations.length === 0) {
      return null;
    }
    const prices = product.variations
      .flatMap(v => {
        const sale = v.salePrice?.trim();
        const reg = v.regularPrice?.trim();
        return [sale || reg].filter((p): p is string => Boolean(p));
      })
      .map(p => parseFloat(p.replace(/[^\d.]/g, '')))
      .filter(n => !isNaN(n) && n > 0);

    if (prices.length === 0) return null;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return minPrice === maxPrice ? null : { min: minPrice, max: maxPrice };
  };

  const variationRange = getVariationPrices();
  const hasSale = variationRange ? false : normalizedSalePrice.length > 0;
  const displayPrice = variationRange
    ? `GH₵${variationRange.min.toFixed(0)} - GH₵${variationRange.max.toFixed(0)}`
    : formatCedi(hasSale ? normalizedSalePrice : normalizedRegularPrice || product.price);
  const showStruckRegular = !variationRange && hasSale && normalizedRegularPrice.length > 0 && normalizedRegularPrice !== normalizedSalePrice;
  const regularPriceLabel = formatCedi(normalizedRegularPrice);

  const discountPct = (() => {
    if (variationRange || !hasSale || !showStruckRegular) return null;
    const parsePrice = (s: string) => parseFloat(s.replace(/[^\d.]/g, ''));
    const reg = parsePrice(normalizedRegularPrice);
    const sale = parsePrice(normalizedSalePrice);
    if (!reg || reg <= 0 || sale >= reg) return null;
    return Math.round(((reg - sale) / reg) * 100);
  })();

  return (
    <Link
      href={cardHref}
      className={`group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${isSoldOut ? 'pointer-events-none opacity-75' : ''}`}
    >
      <div className={`relative overflow-hidden bg-slate-100 ${isCompact ? 'h-36' : 'h-52'}`}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {showCategory && product.category ? (
          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur">
            {product.category}
          </span>
        ) : null}

        {discountPct !== null && !isSoldOut ? (
          <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            -{discountPct}%
          </span>
        ) : null}

        {isSoldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-black uppercase tracking-widest text-slate-800 shadow">
              Sold Out
            </span>
          </div>
        ) : (
          <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-slate-700 shadow-sm backdrop-blur">
            <FiShoppingCart className="text-base" />
          </span>
        )}
      </div>

      <div className={isCompact ? 'p-3 text-center' : 'p-4 text-center'}>
        <h3 className={`line-clamp-2 font-semibold text-slate-900 ${isCompact ? 'text-base' : 'text-lg'}`}>{product.name}</h3>

        <div className="mt-2 flex items-end justify-center gap-2">
          <p className={`font-extrabold text-orange-500 ${isCompact ? 'text-base' : 'text-xl'}`}>{displayPrice}</p>
          {showStruckRegular ? <p className="text-sm font-semibold text-slate-400 line-through">{regularPriceLabel}</p> : null}
        </div>

        {showViewLabel ? <p className="mt-2 text-sm font-medium text-slate-500">View details</p> : null}
      </div>
    </Link>
  );
}
