import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import type { LatLng } from '../../types'

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function createIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

const pickupIcon = createIcon('#3b82f6')
const deliveryIcon = createIcon('#22c55e')
const courierIcon = createIcon('#f97316')

interface DeliveryMapProps {
  pickups?: LatLng[]
  deliveries?: LatLng[]
  couriers?: LatLng[]
  routes?: LatLng[][]
  height?: string
  color?: string
}

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [points, map])
  return null
}

export function DeliveryMap({ pickups = [], deliveries = [], couriers = [], routes = [], height = '300px', color = '#f97316' }: DeliveryMapProps) {
  const allPoints = [...pickups, ...deliveries, ...couriers]
  const center: [number, number] = allPoints.length > 0
    ? [allPoints.reduce((s, p) => s + p.lat, 0) / allPoints.length, allPoints.reduce((s, p) => s + p.lng, 0) / allPoints.length]
    : [41.0082, 28.9784] // Istanbul default

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-border-subtle">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {allPoints.length > 0 && <FitBounds points={allPoints} />}
        {pickups.map((p, i) => <Marker key={`p${i}`} position={[p.lat, p.lng]} icon={pickupIcon} />)}
        {deliveries.map((p, i) => <Marker key={`d${i}`} position={[p.lat, p.lng]} icon={deliveryIcon} />)}
        {couriers.map((p, i) => <Marker key={`c${i}`} position={[p.lat, p.lng]} icon={courierIcon} />)}
        {routes.map((route, i) => (
          <Polyline key={`r${i}`} positions={route.map(p => [p.lat, p.lng])} color={color} weight={3} opacity={0.7} />
        ))}
      </MapContainer>
    </div>
  )
}
