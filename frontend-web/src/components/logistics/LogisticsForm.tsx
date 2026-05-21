'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLogistics, NeedCategory, LogisticsPriority, type LogisticsItem } from '@/hooks/use-logistics';
import { Trash2, Package, MapPin, AlertTriangle } from 'lucide-react';

const categoryConfig: Record<NeedCategory, { label: string; icon: string; items: string[] }> = {
  [NeedCategory.SEMBAKO]: {
    label: 'SEMBAKO (Food Packages)',
    icon: 'F',
    items: ['Beras 5kg', 'Minyak Goreng 1L', 'Gula Pasir 1kg', 'Garam 500g', 'Kecap 200ml'],
  },
  [NeedCategory.SELIMUT]: {
    label: 'SELIMUT (Blankets)',
    icon: 'B',
    items: ['Selimut Dewasa', 'Selimut Anak', 'Bantal', 'Kasur'],
  },
  [NeedCategory.MEDIS]: {
    label: 'MEDIS (Medical Supplies)',
    icon: 'M',
    items: ['Obat Luka', 'Perban', 'Antiseptik', 'Masker', 'Sarung Tangan', 'Termometer'],
  },
  [NeedCategory.BAYI]: {
    label: 'BAYI (Baby Supplies)',
    icon: 'Y',
    items: ['Popok', 'Susu Formula', 'Bubur Bayi', 'Minyak Bayi', 'Bedak'],
  },
  [NeedCategory.AIR]: {
    label: 'AIR (Clean Water)',
    icon: 'W',
    items: ['Air Minum 1L', 'Air Minum 5L', 'Galon', 'Tabung Gas 3kg'],
  },
};

interface LogisticsFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LogisticsForm({ onSuccess, onCancel }: LogisticsFormProps) {
  const navigate = useNavigate();
  const { createRequest } = useLogistics({ autoFetch: false });

  const [formData, setFormData] = useState({
    incidentId: '',
    requesterName: '',
    requesterPhone: '',
    requesterLocation: '',
    priority: LogisticsPriority.NORMAL,
    deliveryAddress: '',
    deliveryLat: 0,
    deliveryLng: 0,
    notes: '',
  });

  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = (category: NeedCategory) => {
    const config = categoryConfig[category];
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        category,
        name: config.items[0],
        quantity: 1,
        unit: 'pcs',
      },
    ]);
  };

  const updateItem = (index: number, field: keyof LogisticsItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.incidentId) {
        setError('Please select an incident');
        setLoading(false);
        return;
      }
      if (items.length === 0) {
        setError('Please add at least one item');
        setLoading(false);
        return;
      }
      if (!formData.deliveryAddress) {
        setError('Please enter delivery address');
        setLoading(false);
        return;
      }

      await createRequest({
        incidentId: formData.incidentId,
        requesterId: 'current-user-id',
        requesterName: formData.requesterName,
        requesterPhone: formData.requesterPhone,
        requesterLocation: formData.requesterLocation,
        items,
        priority: formData.priority,
        deliveryLocation: {
          address: formData.deliveryAddress,
          lat: formData.deliveryLat,
          lng: formData.deliveryLng,
        },
        notes: formData.notes,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard/admin/logistics');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create request';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incident Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Incident</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Select Incident</Label>
            <Select
              value={formData.incidentId}
              onValueChange={(value) => setFormData({ ...formData, incidentId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select incident..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inc-001">Gempa Jawa Tengah 2024</SelectItem>
                <SelectItem value="inc-002">Banjir Jakarta 2024</SelectItem>
                <SelectItem value="inc-003">Erupsi Merapi 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requester Info */}
      <Card>
        <CardHeader>
          <CardTitle>Requester Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Requester Name</Label>
              <Input
                value={formData.requesterName}
                onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                placeholder="Enter requester name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input
                value={formData.requesterPhone}
                onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Requester Location</Label>
              <Input
                value={formData.requesterLocation}
                onChange={(e) => setFormData({ ...formData, requesterLocation: e.target.value })}
                placeholder="Enter location (village, district)"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items Requested</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Category Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            {Object.entries(categoryConfig).map(([category, config]) => (
              <Button
                key={category}
                type="button"
                variant="outline"
                onClick={() => addItem(category as NeedCategory)}
                className="h-auto py-2"
              >
                <span className="block">{config.icon}</span>
                <span className="block text-xs">{config.label}</span>
              </Button>
            ))}
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No items added yet. Click a category above to add items.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Select
                      value={item.category}
                      onValueChange={(value) => updateItem(index, 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([cat, config]) => (
                          <SelectItem key={cat} value={cat}>
                            {config.icon} {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={item.name}
                      onValueChange={(value) => updateItem(index, 'name', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryConfig[item.category as NeedCategory]?.items.map((itemName) => (
                          <SelectItem key={itemName} value={itemName}>
                            {itemName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                    <Input
                      value={item.notes || ''}
                      onChange={(e) => updateItem(index, 'notes', e.target.value)}
                      placeholder="Notes (optional)"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Priority & Delivery */}
      <Card>
        <CardHeader>
          <CardTitle>Priority & Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as LogisticsPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LogisticsPriority.LOW}>Low</SelectItem>
                  <SelectItem value={LogisticsPriority.NORMAL}>Normal</SelectItem>
                  <SelectItem value={LogisticsPriority.HIGH}>High</SelectItem>
                  <SelectItem value={LogisticsPriority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Delivery Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="Enter delivery address"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                step={0.000001}
                value={formData.deliveryLat}
                onChange={(e) => setFormData({ ...formData, deliveryLat: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                step={0.000001}
                value={formData.deliveryLng}
                onChange={(e) => setFormData({ ...formData, deliveryLng: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel || (() => navigate('/dashboard/admin/logistics'))}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Request'}
        </Button>
      </div>
    </form>
  );
}