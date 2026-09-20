import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface PropertyMapProps {
  coordinates?: [number, number] | { lat?: number; lng?: number };
  propertyName?: string;
  address?: string;
  height?: number;
}

export default function PropertyMap({
  coordinates,
  propertyName = "Villa",
  address = "Lonavala, Maharashtra",
  height = 240,
}: PropertyMapProps) {
  const [mapType, setMapType] = useState<"map" | "satellite">("map");
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  // Extract lat, lng
  const { lat, lng } = useMemo(() => {
    let latVal = 18.7557; // Default Lonavala / Malavli
    let lngVal = 73.4091;

    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      if (typeof coordinates[0] === "number" && !isNaN(coordinates[0])) latVal = coordinates[0];
      if (typeof coordinates[1] === "number" && !isNaN(coordinates[1])) lngVal = coordinates[1];
    } else if (coordinates && typeof coordinates === "object") {
      const c = coordinates as { lat?: number; lng?: number };
      if (typeof c.lat === "number" && !isNaN(c.lat)) latVal = c.lat;
      if (typeof c.lng === "number" && !isNaN(c.lng)) lngVal = c.lng;
    }

    return { lat: latVal, lng: lngVal };
  }, [coordinates]);

  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";

  const handleOpenExternal = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}

    const query = encodeURIComponent(`${propertyName}, ${address}`);
    const nativeUrl = Platform.select({
      ios: `maps:0,0?q=${query}@${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(propertyName)})`,
    });

    if (nativeUrl) {
      Linking.openURL(nativeUrl).catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
      });
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    }
  };

  const handleSwitchType = async (type: "map" | "satellite") => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    setMapType(type);

    if (webViewRef.current) {
      const code = `
        if (window.setMapType) {
          window.setMapType('${type === "satellite" ? "hybrid" : "roadmap"}');
        }
      `;
      webViewRef.current.injectJavaScript(code);
    }
  };

  const handleZoom = async (delta: number) => {
    try {
      await Haptics.selectionAsync();
    } catch {}

    if (webViewRef.current) {
      const code = `
        if (window.changeZoom) {
          window.changeZoom(${delta});
        }
      `;
      webViewRef.current.injectJavaScript(code);
    }
  };

  const handleRecenter = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}

    if (webViewRef.current) {
      const code = `
        if (window.recenterMap) {
          window.recenterMap();
        }
      `;
      webViewRef.current.injectJavaScript(code);
    }
  };

  // Generate clean modern HTML for Google Maps JS API or Leaflet vector fallback
  const htmlContent = useMemo(() => {
    const escapedTitle = propertyName.replace(/'/g, "\\'").replace(/"/g, '\\"');

    if (googleMapsApiKey) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body, #map { width: 100%; height: 100%; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          </style>
          <script src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places"></script>
        </head>
        <body>
          <div id="map"></div>
          <script>
            let map;
            let marker;
            const centerPos = { lat: ${lat}, lng: ${lng} };

            function initMap() {
              map = new google.maps.Map(document.getElementById('map'), {
                center: centerPos,
                zoom: 14,
                mapTypeId: '${mapType === "satellite" ? "hybrid" : "roadmap"}',
                disableDefaultUI: true,
                zoomControl: false,
                gestureHandling: 'greedy',
                styles: [
                  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
                ]
              });

              // Custom Modern SVG Marker
              marker = new google.maps.Marker({
                position: centerPos,
                map: map,
                title: "${escapedTitle}",
                animation: google.maps.Animation.DROP,
                icon: {
                  url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48"><defs><filter id="shadow" x="-20%" y="-10%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="%23000000" flood-opacity="0.25"/></filter></defs><path fill="%23FF5A1F" filter="url(%23shadow)" d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z"/><circle cx="18" cy="18" r="8" fill="%23FFFFFF"/><circle cx="18" cy="18" r="4" fill="%23FF5A1F"/></svg>',
                  scaledSize: new google.maps.Size(36, 48),
                  anchor: new google.maps.Point(18, 48)
                }
              });
            }

            window.setMapType = function(type) {
              if (map) map.setMapTypeId(type);
            };

            window.changeZoom = function(delta) {
              if (map) map.setZoom(map.getZoom() + delta);
            };

            window.recenterMap = function() {
              if (map) {
                map.panTo(centerPos);
                map.setZoom(14);
              }
            };

            window.onload = initMap;
          </script>
        </body>
        </html>
      `;
    }

    // Leaflet vector fallback if Google Maps API key is missing
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { width: 100%; height: 100%; background: #e5e3df; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .leaflet-control-attribution { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map;
          const pos = [${lat}, ${lng}];

          function initMap() {
            map = L.map('map', { zoomControl: false, attributionControl: false }).setView(pos, 14);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              maxZoom: 19
            }).addTo(map);

            const customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: '<div style="background-color:%23FF5A1F;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid %23fff;box-shadow:0 4px 10px rgba(0,0,0,0.3);"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>',
              iconSize: [32, 32],
              iconAnchor: [16, 32]
            });

            L.marker(pos, { icon: customIcon }).addTo(map);
          }

          window.changeZoom = function(delta) {
            if (map) {
              if (delta > 0) map.zoomIn();
              else map.zoomOut();
            }
          };

          window.recenterMap = function() {
            if (map) map.setView(pos, 14);
          };

          window.onload = initMap;
        </script>
      </body>
      </html>
    `;
  }, [googleMapsApiKey, lat, lng, propertyName, mapType]);

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webView}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#FF5A1F" />
          <Text style={styles.loadingText}>Loading interactive map...</Text>
        </View>
      )}

      {/* Top Left: Map / Satellite switcher (Matching Screenshot 5) */}
      <View style={styles.topSwitcher}>
        <TouchableOpacity
          style={[styles.switchBtn, mapType === "map" && styles.switchBtnActive]}
          onPress={() => handleSwitchType("map")}
          activeOpacity={0.8}
        >
          <Text style={[styles.switchText, mapType === "map" && styles.switchTextActive]}>
            Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchBtn, mapType === "satellite" && styles.switchBtnActive]}
          onPress={() => handleSwitchType("satellite")}
          activeOpacity={0.8}
        >
          <Text style={[styles.switchText, mapType === "satellite" && styles.switchTextActive]}>
            Satellite
          </Text>
        </TouchableOpacity>
      </View>

      {/* Top Right: Open in Native Google / Apple Maps */}
      <TouchableOpacity
        style={styles.openExternalBtn}
        onPress={handleOpenExternal}
        activeOpacity={0.85}
      >
        <Ionicons name="navigate" size={14} color="#FF5A1F" style={{ marginRight: 4 }} />
        <Text style={styles.openExternalText}>Open in Maps</Text>
      </TouchableOpacity>

      {/* Bottom Right: Zoom and Recenter Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.controlIconBtn} onPress={() => handleZoom(1)}>
          <Ionicons name="add" size={18} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.controlDivider} />
        <TouchableOpacity style={styles.controlIconBtn} onPress={() => handleZoom(-1)}>
          <Ionicons name="remove" size={18} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.controlDivider} />
        <TouchableOpacity style={styles.controlIconBtn} onPress={handleRecenter}>
          <Ionicons name="locate" size={16} color="#FF5A1F" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  webView: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  topSwitcher: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 20,
  },
  switchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 7,
  },
  switchBtnActive: {
    backgroundColor: "#FF5A1F",
  },
  switchText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  switchTextActive: {
    color: "#FFFFFF",
  },
  openExternalBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 20,
  },
  openExternalText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1F2937",
  },
  bottomControls: {
    position: "absolute",
    bottom: 12,
    right: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 20,
  },
  controlIconBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  controlDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
});
