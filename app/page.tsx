'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DealParams {
  artistName: string;
  advance: number;
  marketing: number;
  songCount: number;
  streamingProfitSplit: number;
  syncProfitSplit: number;
  physicalProfitSplit: number;
  brandProfitSplit: number;
  streamRate: number;
  streamsPerSong: number;
  syncPerSong: number;
  physicalGoods: number;
  brandPartnerships: number;
  growthRate: number;
}

export default function DealCalculator() {
  const [dealParams, setDealParams] = useState<DealParams>({
    artistName: '',
    advance: 75000,
    marketing: 75000,
    songCount: 20,
    streamingProfitSplit: 50,
    syncProfitSplit: 25,
    physicalProfitSplit: 20,
    brandProfitSplit: 30,
    streamRate: 0.004,
    streamsPerSong: 500000,
    syncPerSong: 2000,
    physicalGoods: 5000,
    brandPartnerships: 10000,
    growthRate: 0,
  });

  const [displayMode, setDisplayMode] = useState<'cumulative' | 'annual'>('cumulative');

const calculateRevenueWithGrowth = (baseRevenue: number, growthRate: number, year: number) => {
    return baseRevenue * Math.pow(1 + growthRate / 100, year - 1);
  };

  const projections = useMemo(() => {
    const totalRecoupable = dealParams.advance + dealParams.marketing;
    let cumulativeArtistGross = 0;
    let recoupYear = null;
    let cumulativeTotalRevenue = 0;
    let cumulativeLabelRevenue = 0;
    let cumulativeArtistNetRevenue = 0;

    return Array.from({ length: 15 }, (_, i) => {
      const year = i + 1;
      const streamingRevenue = calculateRevenueWithGrowth(
        dealParams.streamsPerSong * dealParams.streamRate * dealParams.songCount,
        dealParams.growthRate,
        year
      );
      const syncRevenue = calculateRevenueWithGrowth(
        dealParams.syncPerSong * dealParams.songCount,
        dealParams.growthRate,
        year
      );
      const physicalRevenue = calculateRevenueWithGrowth(
        dealParams.physicalGoods,
        dealParams.growthRate,
        year
      );
      const brandRevenue = calculateRevenueWithGrowth(
        dealParams.brandPartnerships,
        dealParams.growthRate,
        year
      );
      const annualTotalRevenue = streamingRevenue + syncRevenue + physicalRevenue + brandRevenue;

      const streamingLabelShare = streamingRevenue * (1 - dealParams.streamingProfitSplit / 100);
      const streamingArtistGross = streamingRevenue * (dealParams.streamingProfitSplit / 100);
      const syncLabelShare = syncRevenue * (1 - dealParams.syncProfitSplit / 100);
      const syncArtistGross = syncRevenue * (dealParams.syncProfitSplit / 100);
      const physicalLabelShare = physicalRevenue * (1 - dealParams.physicalProfitSplit / 100);
      const physicalArtistGross = physicalRevenue * (dealParams.physicalProfitSplit / 100);
      const brandLabelShare = brandRevenue * (1 - dealParams.brandProfitSplit / 100);
      const brandArtistGross = brandRevenue * (dealParams.brandProfitSplit / 100);

      const annualLabelRevenue = streamingLabelShare + syncLabelShare + physicalLabelShare + brandLabelShare;
      const annualArtistGrossThisYear = streamingArtistGross + syncArtistGross + physicalArtistGross + brandArtistGross;

      cumulativeTotalRevenue += annualTotalRevenue;
      cumulativeLabelRevenue += annualLabelRevenue;

      const previousCumulativeArtistGross = cumulativeArtistGross;
      cumulativeArtistGross += annualArtistGrossThisYear;

      let artistNetThisYear;
      if (cumulativeArtistGross <= totalRecoupable) {
        artistNetThisYear = 0;
      } else if (previousCumulativeArtistGross < totalRecoupable) {
        const excess = cumulativeArtistGross - totalRecoupable;
        artistNetThisYear = excess;
        if (!recoupYear) recoupYear = year;
      } else {
        artistNetThisYear = annualArtistGrossThisYear;
      }

      cumulativeArtistNetRevenue += artistNetThisYear;

      return {
        year,
        annualTotalRevenue,
        annualLabelRevenue,
        annualArtistRevenue: artistNetThisYear,
        cumulativeTotalRevenue,
        cumulativeLabelRevenue,
        cumulativeArtistRevenue: cumulativeArtistNetRevenue,
        recoupYear,
      };
    });
  }, [dealParams]);

  const recoupYear = projections.find((proj) => proj.recoupYear)?.recoupYear || 'Not recouped within 15 years';

  const InputField = ({ label, name, value, type = "number", min = "0", step }: {
    label: string;
    name: keyof DealParams;
    value: number | string;
    type?: string;
    min?: string;
    step?: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium" htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={handleInputChange}
        min={min}
        step={step}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="w-full max-w-6xl p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Venice Deal Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Deal Parameters</h3>
              <div className="space-y-4">
                <InputField
                  label="Artist Name"
                  name="artistName"
                  value={dealParams.artistName}
                  type="text"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Advance ($)"
                    name="advance"
                    value={dealParams.advance}
                  />
                  <InputField
                    label="Marketing ($)"
                    name="marketing"
                    value={dealParams.marketing}
                  />
                  <InputField
                    label="Song Count"
                    name="songCount"
                    value={dealParams.songCount}
                  />
                  <InputField
                    label="Growth Rate (%)"
                    name="growthRate"
                    value={dealParams.growthRate}
                    step="0.1"
                  />
                  <InputField
                    label="Streaming Split (%)"
                    name="streamingProfitSplit"
                    value={dealParams.streamingProfitSplit}
                  />
                  <InputField
                    label="Sync Split (%)"
                    name="syncProfitSplit"
                    value={dealParams.syncProfitSplit}
                  />
                  <InputField
                    label="Physical Split (%)"
                    name="physicalProfitSplit"
                    value={dealParams.physicalProfitSplit}
                  />
                  <InputField
                    label="Brand Split (%)"
                    name="brandProfitSplit"
                    value={dealParams.brandProfitSplit}
                  />
                  <InputField
                    label="Stream Rate ($)"
                    name="streamRate"
                    value={dealParams.streamRate}
                    step="0.001"
                  />
                  <InputField
                    label="Streams per Song"
                    name="streamsPerSong"
                    value={dealParams.streamsPerSong}
                  />
                  <InputField
                    label="Sync per Song ($)"
                    name="syncPerSong"
                    value={dealParams.syncPerSong}
                  />
                  <InputField
                    label="Physical Goods ($)"
                    name="physicalGoods"
                    value={dealParams.physicalGoods}
                  />
                  <InputField
                    label="Brand Partnerships ($)"
                    name="brandPartnerships"
                    value={dealParams.brandPartnerships}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Deal Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Investment</p>
                    <p className="text-xl font-semibold">
                      ${(dealParams.advance + dealParams.marketing).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Years to Recoup</p>
                    <p className="text-xl font-semibold">
                      {recoupYear === 'Not recouped within 15 years' ? recoupYear : `${recoupYear} years`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mb-4">
                <Button
                  variant={displayMode === 'cumulative' ? 'default' : 'outline'}
                  onClick={() => setDisplayMode('cumulative')}
                >
                  Cumulative
                </Button>
                <Button
                  variant={displayMode === 'annual' ? 'default' : 'outline'}
                  onClick={() => setDisplayMode('annual')}
                >
                  Annual
                </Button>
              </div>

              <div className="h-96">
                <h3 className="text-lg font-semibold mb-4">Revenue Projections</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={displayMode === 'cumulative' ? 'cumulativeTotalRevenue' : 'annualTotalRevenue'}
                      stroke="#8884d8"
                      name="Total Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey={displayMode === 'cumulative' ? 'cumulativeLabelRevenue' : 'annualLabelRevenue'}
                      stroke="#82ca9d"
                      name="Label Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey={displayMode === 'cumulative' ? 'cumulativeArtistRevenue' : 'annualArtistRevenue'}
                      stroke="#ffc658"
                      name="Artist Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
