// components/RouteSelectorSheet.tsx
import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Platform } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';

export interface Route {
  id: string;
  name: string;
  color: string;
  activeBuses: number;
}

interface RouteSelectorSheetProps {
  sheetRef: React.RefObject<BottomSheet>;
  routes: Route[];
  selectedRoute: string | null;
  onRouteSelect: (routeId: string) => void;
  onDismiss: () => void;
}

export default function RouteSelectorSheet({
  sheetRef,
  routes,
  selectedRoute,
  onRouteSelect,
  onDismiss,
}: RouteSelectorSheetProps) {

  const snapPoints = useMemo(() => ['72px', '45%'], []);

  // Calcular número de columnas automático
  const screenWidth = Dimensions.get('window').width;
  const numColumns = Math.max(1, Math.floor((screenWidth - 48) / 64)); // Margen horizontal + gap

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      onDismiss();
    }
  }, [onDismiss]);

  const activeRouteObj = useMemo(() => 
    routes.find(r => r.id === selectedRoute),
  [routes, selectedRoute]);

  const renderRouteChip = ({ item }: { item: Route }) => {
    const isActive = item.id === selectedRoute;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRouteSelect(item.id);
        }}
        style={[
            styles.chip,
            isActive ? { backgroundColor: item.color, ...styles.chipActiveShadow, shadowColor: item.color } : styles.chipInactive,
            { width: 56 } // Grid spec fijo
        ]}
      >
        <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
          {item.id.replace('L0', '')}
        </Text>
        {item.activeBuses > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.activeBuses}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={null} // Backdropopacity = 0
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      onChange={handleSheetChange}
      animationConfigs={{
        damping: 22,
        stiffness: 180,
      }}
    >
      <BottomSheetView style={styles.container}>
        {/* Estado colapsado parcial: Mostrar la ruta actual en línea */}
        {activeRouteObj && (
            <View style={styles.currentRouteHeader}>
                <View style={[styles.miniDot, { backgroundColor: activeRouteObj.color }]} />
                <Text style={styles.currentRouteName}>{activeRouteObj.name}</Text>
            </View>
        )}

        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={renderRouteChip}
          numColumns={numColumns}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleIndicator: {
    width: 40,
    backgroundColor: '#E2E8F0',
  },
  container: {
    flex: 1,
  },
  currentRouteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
    marginTop: -8, // Ajuste para pegarlo más al handle
    height: 32,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  currentRouteName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  gridContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  gridRow: {
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  chip: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chipInactive: {
    backgroundColor: '#F0F4F8',
  },
  chipActiveShadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  chipText: {
    fontSize: 16,
    fontWeight: '700',
  },
  chipTextInactive: {
    color: '#888888',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  }
});
