import { useState } from 'react';
import { Coins, ShoppingCart, CreditCard, Wallet, CircleDollarSign, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COIN_PACKAGES = [
  { id: 1, coins: 50, price: 0.99, label: 'Starter' },
  { id: 2, coins: 150, price: 2.49, label: 'Popular', popular: true },
  { id: 3, coins: 350, price: 4.99, label: 'Value', bonus: 50 },
  { id: 4, coins: 750, price: 9.99, label: 'Premium', bonus: 150 },
  { id: 5, coins: 1600, price: 19.99, label: 'Mega', bonus: 400 },
  { id: 6, coins: 5000, price: 49.99, label: 'Ultimate', bonus: 1500 },
];

const PAYMENT_METHODS = [
  { id: 'stripe', label: 'Card / Stripe', icon: CreditCard },
  { id: 'paypal', label: 'PayPal', icon: Wallet },
  { id: 'usdt', label: 'USDT', icon: CircleDollarSign },
] as const;

export default function CoinShop() {
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('stripe');

  const selected = COIN_PACKAGES.find(p => p.id === selectedPkg);

  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-coin-gold/15 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-coin-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Coin Shop</h1>
            <p className="text-sm text-muted-foreground">Purchase coins to unlock premium chapters</p>
          </div>
        </div>

        {/* Balance */}
        <div className="flex items-center gap-2 rounded-full bg-card border border-border/60 px-4 py-2">
          <Coins className="w-4 h-4 text-coin-gold" />
          <span className="font-semibold text-sm text-foreground">240</span>
        </div>
      </div>

      {/* ──────── Packages ──────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-foreground mb-4">Choose a Package</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {COIN_PACKAGES.map((pkg) => {
            const isSelected = selectedPkg === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg.id)}
                className={`relative rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 hover:scale-[1.02] ${
                  isSelected
                    ? 'border-primary bg-primary/[0.05] ring-2 ring-primary/30 shadow-md'
                    : 'border-border/60 bg-card hover:border-border'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-primary text-primary-foreground px-3 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> POPULAR
                  </span>
                )}

                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Coins className="w-5 h-5 text-coin-gold" />
                  <span className="text-xl font-bold text-foreground">{pkg.coins.toLocaleString()}</span>
                </div>

                {pkg.bonus && (
                  <span className="inline-block text-[10px] font-semibold bg-accent text-accent-foreground px-2 py-0.5 rounded-full mb-2">
                    +{pkg.bonus} BONUS
                  </span>
                )}

                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">{pkg.label}</span>
                  <span className="text-lg font-bold text-foreground">${pkg.price}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ──────── Payment Method ──────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-foreground mb-4">Payment Method</h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {PAYMENT_METHODS.map((method) => {
            const isActive = paymentMethod === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 sm:flex-1 transition-all duration-200 ${
                  isActive
                    ? 'border-primary bg-primary/[0.05] ring-1 ring-primary/30'
                    : 'border-border/60 bg-card hover:border-border'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-primary/15' : 'bg-muted/50'
                }`}>
                  <method.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {method.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ──────── Purchase Button ──────── */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {selected ? (
          <>
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-coin-gold" />
              <div>
                <p className="font-semibold text-foreground">
                  {selected.coins.toLocaleString()} Coins
                  {selected.bonus ? ` + ${selected.bonus} Bonus` : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  via {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}
                </p>
              </div>
            </div>
            <Button className="rounded-xl px-8 gap-2 text-base h-12 w-full sm:w-auto">
              <ShoppingCart className="w-4 h-4" />
              Buy for ${selected.price}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground w-full text-center">Select a coin package above to proceed</p>
        )}
      </div>
    </div>
  );
}
