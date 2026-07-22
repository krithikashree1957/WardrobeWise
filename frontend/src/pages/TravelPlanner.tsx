import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { travelPlannerService } from '../services/travelPlannerService';
import type { MarketplaceRecommendation, TravelDayPlan, TravelPlan } from '../types';
import { Icon } from '../components/common/Icon';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';
import { getErrorMessage } from '../lib/utils';

const PURPOSES = ['Tourism', 'Business', 'College', 'Wedding', 'Vacation', 'Casual'];

const STORE_STYLES: Record<string, string> = {
  Amazon: 'bg-amber-100 text-amber-700',
  Myntra: 'bg-pink-100 text-pink-700',
  Flipkart: 'bg-sky-100 text-sky-700',
};

const SLOT_LABELS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};

function OutfitThumbnails({ slot }: { slot: TravelDayPlan['slots'][number] }) {
  const items = [slot.top, slot.bottom, slot.shoes, slot.outerwear, ...slot.accessories].filter(Boolean) as any[];
  if (items.length === 0) return null;
  return (
    <div className="flex gap-2">
      {items.map((it) => (
        <div key={it._id} className="w-12 h-12 rounded-md overflow-hidden bg-surface-container-high flex-none">
          <img src={it.imageUrl} alt={it.color} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function ShoppingRecommendations({ recommendations }: { recommendations: MarketplaceRecommendation[] }) {
  if (recommendations.length === 0) return null;
  return (
    <div className="space-y-stack-md">
      <h4 className="font-title-md text-title-md flex items-center gap-2">
        <Icon name="storefront" className="text-primary" /> Shop for What's Missing
      </h4>
      {recommendations.map((rec) => (
        <div key={rec.category} className="space-y-2">
          <p className="text-body-sm text-on-surface-variant">{rec.reason}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {rec.products.map((product) => (
              <div key={product.id} className="bg-white/50 rounded-lg overflow-hidden flex flex-col">
                <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-body-lg font-semibold leading-snug">{product.name}</span>
                    <span
                      className={`text-[10px] font-label-caps px-2 py-1 rounded-full uppercase flex-none ${STORE_STYLES[product.store]}`}
                    >
                      {product.store}
                    </span>
                  </div>
                  <span className="font-semibold text-body-sm">${product.price}</span>
                  <a
                    href={product.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto w-full text-center lavender-gradient text-on-primary font-label-caps text-label-caps py-2.5 rounded-xl button-glow"
                  >
                    BUY NOW
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * AI Travel Wardrobe Planner - takes trip details, pulls expected weather
 * for the destination, builds a packing checklist compared against the
 * user's wardrobe, generates a day-by-day outfit plan, and recommends
 * marketplace products for whatever's missing.
 */
export default function TravelPlanner() {
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [recommendationsByPlan, setRecommendationsByPlan] = useState<Record<string, MarketplaceRecommendation[]>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [days, setDays] = useState(3);
  const [travelMonth, setTravelMonth] = useState('');
  const [purpose, setPurpose] = useState('Tourism');

  const load = async () => {
    setLoading(true);
    try {
      const res = await travelPlannerService.list();
      setPlans(res.data.data.travelPlans);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    if (!destination || !country || !travelMonth) {
      toast.error('Destination, country, and travel month are required.');
      return;
    }
    setGenerating(true);
    try {
      const res = await travelPlannerService.create({ destination, country, state: state || undefined, days, travelMonth, purpose });
      const { travelPlan, shoppingRecommendations } = res.data.data;
      setPlans((prev) => [travelPlan, ...prev]);
      setRecommendationsByPlan((prev) => ({ ...prev, [travelPlan._id]: shoppingRecommendations }));
      setExpandedId(travelPlan._id);
      toast.success('Travel plan generated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const toggleExpanded = async (plan: TravelPlan) => {
    if (expandedId === plan._id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(plan._id);
    if (!recommendationsByPlan[plan._id]) {
      try {
        const res = await travelPlannerService.get(plan._id);
        setRecommendationsByPlan((prev) => ({ ...prev, [plan._id]: res.data.data.shoppingRecommendations }));
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
  };

  return (
    <AppShell>
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">
          Travel Wardrobe Planner
        </h1>
        <p className="text-on-surface-variant font-body-sm">
          Weather-aware packing checklists and day-by-day outfits for your next trip.
        </p>
      </section>

      <section className="glass-surface p-gutter rounded-lg space-y-stack-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Destination</label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Manali"
              className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
            />
          </div>
          <div className="space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. India"
              className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
            />
          </div>
          <div className="space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">State (optional)</label>
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Himachal Pradesh"
              className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
            />
          </div>
          <div className="space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Travel Month</label>
            <input
              value={travelMonth}
              onChange={(e) => setTravelMonth(e.target.value)}
              placeholder="e.g. December"
              className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
            />
          </div>
          <div className="space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Days</label>
            <input
              type="number"
              min={1}
              max={60}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
            />
          </div>
          <div className="space-y-unit">
            <label className="font-label-caps text-label-caps text-outline uppercase">Purpose of Travel</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary h-12 px-4 font-body-lg"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="w-full lavender-gradient text-on-primary font-title-md text-title-md py-4 rounded-xl button-glow disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {generating ? (
            <Icon name="progress_activity" className="animate-spin" />
          ) : (
            <Icon name="travel_explore" />
          )}
          {generating ? 'Planning your trip...' : 'Generate Travel Plan'}
        </button>
      </section>

      <section className="space-y-stack-md">
        {loading ? (
          <div className="animate-pulse h-40 glass-surface rounded-lg" />
        ) : plans.length === 0 ? (
          <EmptyState
            icon="luggage"
            title="No travel plans yet"
            description="Fill in your trip details above to get a weather-aware packing checklist and daily outfit plan."
          />
        ) : (
          plans.map((plan) => (
            <div key={plan._id} className="glass-surface p-gutter rounded-lg space-y-stack-md">
              <button
                onClick={() => toggleExpanded(plan)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h3 className="font-title-md text-title-md">
                    {plan.destination}, {plan.state ? `${plan.state}, ` : ''}
                    {plan.country}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    {plan.days} days · {plan.travelMonth} · {plan.purpose}
                    {plan.expectedWeather?.tempC !== undefined &&
                      ` · Expect ${Math.round(plan.expectedWeather.tempC)}°C, ${plan.expectedWeather.condition}`}
                  </p>
                </div>
                <Icon name={expandedId === plan._id ? 'expand_less' : 'expand_more'} className="text-primary" />
              </button>

              {expandedId === plan._id && (
                <div className="space-y-stack-lg pt-2">
                  {/* Packing Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                    <div className="space-y-2">
                      <h4 className="font-label-caps text-label-caps text-emerald-700 uppercase flex items-center gap-1">
                        <Icon name="check_circle" className="text-sm" /> Already Available
                      </h4>
                      {plan.checklist.filter((c) => c.available).length === 0 ? (
                        <p className="text-body-sm text-on-surface-variant">Nothing matched yet - your wardrobe may be empty.</p>
                      ) : (
                        <ul className="space-y-1">
                          {plan.checklist
                            .filter((c) => c.available)
                            .map((c, i) => (
                              <li key={i} className="bg-emerald-50 text-emerald-700 rounded-lg px-3 py-2 text-body-sm">
                                {c.label}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-label-caps text-label-caps text-amber-700 uppercase flex items-center gap-1">
                        <Icon name="error" className="text-sm" /> Missing Items
                      </h4>
                      {plan.checklist.filter((c) => !c.available).length === 0 ? (
                        <p className="text-body-sm text-on-surface-variant">You're fully packed - nothing missing!</p>
                      ) : (
                        <ul className="space-y-1">
                          {plan.checklist
                            .filter((c) => !c.available)
                            .map((c, i) => (
                              <li key={i} className="bg-amber-50 text-amber-700 rounded-lg px-3 py-2 text-body-sm">
                                {c.label}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Daily Outfit Planner */}
                  <div className="space-y-stack-md">
                    <h4 className="font-title-md text-title-md">Daily Outfit Planner</h4>
                    {plan.dailyPlans.map((day) => (
                      <div key={day.day} className="bg-white/50 rounded-lg p-4 space-y-3">
                        <span className="font-label-caps text-label-caps text-primary uppercase">Day {day.day}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {day.slots.map((slot) => (
                            <div key={slot.slot} className="flex items-start gap-3 bg-surface-container-low rounded-lg p-3">
                              <div className="flex-1">
                                <span className="text-label-caps font-label-caps text-outline uppercase">
                                  {SLOT_LABELS[slot.slot]}
                                </span>
                                <p className="text-body-sm text-on-surface-variant mt-1">{slot.note}</p>
                                <div className="mt-2">
                                  <OutfitThumbnails slot={slot} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <ShoppingRecommendations recommendations={recommendationsByPlan[plan._id] || []} />
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </AppShell>
  );
}
