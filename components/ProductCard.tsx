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

  const priceTextClass = isCompact ? 'text-xs' : 'text-sm';

  return (
    <Link
      href={cardHref}
      className={`group block overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_30px_-20px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_26px_55px_-24px_rgba(15,23,42,0.6)] ${isSoldOut ? 'pointer-events-none opacity-80' : ''}`}
    >
      <div className={`relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-white ${isCompact ? 'h-40' : 'h-56'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(249,115,22,0.2),transparent_42%)]" />
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

        {showCategory && product.category ? (
          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700 backdrop-blur">
            {product.category}
          </span>
        ) : null}

        {discountPct !== null && !isSoldOut ? (
          <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-black text-white shadow">
            -{discountPct}%
          </span>
        ) : null}

        {isSoldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-black uppercase tracking-[0.18em] text-slate-800 shadow">
              Sold Out
            </span>
          </div>
        ) : (
          <>
            <span className="absolute bottom-3 left-3 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow">
              In stock
            </span>
            <span className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/95 text-slate-700 shadow-sm backdrop-blur transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
              <FiShoppingCart className="text-base" />
            </span>
          </>
        )}
      </div>

      <div className={isCompact ? 'p-3.5' : 'p-5'}>
        <h3 className={`line-clamp-2 text-center font-black leading-tight text-slate-900 ${isCompact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}>{product.name}</h3>

        <div className="mt-2 flex min-w-0 flex-col items-center">
          <p className={`text-center font-black text-orange-500 whitespace-nowrap leading-none tracking-tight ${priceTextClass}`}>{displayPrice}</p>
          {showStruckRegular ? <p className="mt-1 text-center pb-0.5 text-[10px] min-[361px]:text-[11px] sm:text-xs font-semibold text-slate-400 line-through whitespace-nowrap">{regularPriceLabel}</p> : null}
        </div>

        {showViewLabel ? (
          <p className="mt-2 text-center text-[10px] min-[361px]:text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 transition-colors group-hover:text-slate-700">
            Order now
          </p>
        ) : null}
      </div>
    </Link>
  );
}
