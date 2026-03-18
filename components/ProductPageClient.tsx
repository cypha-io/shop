'use client';

import { useState, useMemo } from 'react';
import { FiTag } from 'react-icons/fi';
import AddToCartButton from '@/components/AddToCartButton';

type Variation = {
  name: string;
  option: string;
  regularPrice?: string | null;
  salePrice?: string | null;
};

type Product = {
  id: number;
  name: string;
  price: string;
  regularPrice?: string | null;
  salePrice?: string | null;
  image: string;
  imageUrls?: string[] | null;
  category: string;
  description?: string;
  stock?: number | null;
  hasVariations?: boolean;
  variations?: Variation[] | null;
};

type ProductPageClientProps = {
  product: Product;
  displayPrice: string;
  regularPriceLabel: string;
  showStruckRegular: boolean;
  isSoldOut: boolean;
  groupedVariations: Map<string, Variation[]>;
};

const formatCedi = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return 'GH₵0';
  if (normalized.includes('₵') || normalized.toUpperCase().startsWith('GH')) return normalized;
  return `GH₵${normalized}`;
};

export default function ProductPageClient({
  product,
  displayPrice,
  regularPriceLabel,
  showStruckRegular,
  isSoldOut,
  groupedVariations,
}: ProductPageClientProps) {
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});

  const allVariationsSelected = useMemo(() => {
    if (!product.hasVariations || groupedVariations.size === 0) return true;
    return Object.keys(selectedVariations).length > 0;
  }, [selectedVariations, product.hasVariations, groupedVariations]);

  const handleVariationSelect = (variationType: string, option: string) => {
    setSelectedVariations((prev) => {
      const next = { ...prev };
      if (!option) {
        delete next[variationType];
        return next;
      }

      next[variationType] = option;
      return next;
    });
  };

  // Helper to extract numeric price from formatted price string
  const getPriceValue = (priceStr: string): number => {
    const normalized = priceStr.trim();
    if (!normalized) return 0;
    const numericValue = parseFloat(normalized.replace(/[^\d.]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Calculate the price based on selected variation(s)
  const getSelectedVariationPrice = () => {
    if (!product.hasVariations || !allVariationsSelected || !product.variations) {
      return displayPrice;
    }

    // Find all selected variations and sum their prices
    let totalPrice = 0;
    let foundAny = false;

    for (const [variationType, selectedOption] of Object.entries(selectedVariations)) {
      const selectedVar = product.variations.find(
        (v) => v.name === variationType && v.option === selectedOption
      );

      if (selectedVar) {
        const varSalePrice = selectedVar.salePrice?.trim();
        const varRegPrice = selectedVar.regularPrice?.trim();
        const varHasSale = varSalePrice && varSalePrice.length > 0;
        const priceToUse = varHasSale ? varSalePrice : varRegPrice || '0';
        totalPrice += getPriceValue(priceToUse);
        foundAny = true;
      }
    }

    if (!foundAny) return displayPrice;

    return `GH₵${totalPrice.toFixed(0)}`;
  };

  const selectedVariationPrice = getSelectedVariationPrice();

  const cartProduct = {
    ...product,
    price: selectedVariationPrice,
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-full">
      <div className="mb-5 inline-flex items-center gap-2 self-start rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700 border border-orange-100">
        <FiTag className="text-sm" />
        {product.category}
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">{product.name}</h1>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Price</p>
        <div className="flex items-end gap-3">
          <p className="text-3xl font-black text-orange-600">{selectedVariationPrice}</p>
          {showStruckRegular ? (
            <p className="text-base font-semibold text-gray-400 line-through">{regularPriceLabel}</p>
          ) : null}
        </div>
      </div>

      {product.hasVariations && groupedVariations.size > 0 && (
        <div className="mb-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Choose Options</h2>
          {Array.from(groupedVariations.entries()).map(([variationType, variations]) => (
            <div key={variationType}>
              <label htmlFor={`variation-${variationType}`} className="mb-1.5 block text-sm font-semibold text-gray-700">
                {variationType}
              </label>
              <select
                id={`variation-${variationType}`}
                value={selectedVariations[variationType] ?? ''}
                onChange={(event) => handleVariationSelect(variationType, event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Select {variationType}</option>
                {variations.map((variation) => {
                  const varSalePrice = variation.salePrice?.trim();
                  const varRegPrice = variation.regularPrice?.trim();
                  const varHasSale = varSalePrice && varSalePrice.length > 0;
                  const varPrice = formatCedi(varHasSale ? varSalePrice : varRegPrice || '0');
                  return (
                    <option key={`${variationType}-${variation.option}`} value={variation.option}>
                      {variation.option} - {varPrice}
                    </option>
                  );
                })}
              </select>
            </div>
          ))}
        </div>
      )}

      {isSoldOut && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
          Out of Stock
        </div>
      )}

      <AddToCartButton
        product={cartProduct}
        disabled={isSoldOut || (product.hasVariations && !allVariationsSelected)}
        className={`w-full inline-flex items-center justify-center gap-3 rounded-xl px-6 py-3.5 text-white font-bold transition-colors ${
          isSoldOut || (product.hasVariations && !allVariationsSelected)
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600'
        }`}
      />
    </div>
  );
}
