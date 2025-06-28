import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

export default function App() {
  const [activeTab, setActiveTab] = useState("fortune");
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);

  // 위치 권한 요청 및 위치 정보 가져오기
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      // 위치 권한 요청
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "위치 권한 필요",
          "Lunch Hunt 기능을 사용하려면 위치 권한이 필요합니다.",
          [{ text: "확인" }]
        );
        setLocationPermission(false);
        return;
      }

      setLocationPermission(true);

      // 현재 위치 가져오기
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error("위치 정보를 가져오는데 실패했습니다:", error);
      Alert.alert("위치 오류", "위치 정보를 가져오는데 실패했습니다.", [
        { text: "확인" },
      ]);
    }
  };

  // lunch tab URL에 위치 파라미터 추가
  const getLunchUrl = () => {
    const baseUrl = "https://lunchhunt.pages.dev/";
    if (location && locationPermission) {
      return `${baseUrl}?lat=${location.latitude}&lng=${location.longitude}`;
    }
    return baseUrl;
  };

  const tabs = [
    {
      key: "fortune",
      label: "나의 운명",
      url: "https://tarofortune.pages.dev",
    },
    {
      key: "lunch",
      label: "Lunch Hunt",
      url: getLunchUrl(),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Header */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.key)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 위치 정보 상태 표시 (선택사항) */}
      {activeTab === "lunch" && (
        <View style={styles.locationStatus}>
          <Text style={styles.locationText}>
            {locationPermission && location
              ? `위치: ${location.latitude.toFixed(
                  4
                )}, ${location.longitude.toFixed(4)}`
              : "위치 정보를 가져오는 중..."}
          </Text>
        </View>
      )}

      {/* WebView Content */}
      <WebView
        source={{ uri: tabs.find((tab) => tab.key === activeTab)?.url }}
        style={styles.webview}
        key={
          activeTab === "lunch"
            ? getLunchUrl()
            : tabs.find((tab) => tab.key === activeTab)?.url
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#007AFF",
    backgroundColor: "#f8f9ff",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  locationStatus: {
    backgroundColor: "#e8f4fd",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#d0e7f7",
  },
  locationText: {
    fontSize: 12,
    color: "#007AFF",
    textAlign: "center",
  },
  webview: {
    flex: 1,
  },
});
