import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

const { width } = Dimensions.get("window");

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home"); // "home" 또는 탭 키
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
      description: "오늘의 운세를 확인해보세요",
      url: "https://tarofortune.pages.dev",
      emoji: "🔮",
    },
    {
      key: "lunch",
      label: "Lunch Hunt",
      description: "맛집을 찾아보세요",
      url: getLunchUrl(),
      emoji: "🍽️",
    },
    {
      key: "hunger-game",
      label: "오늘 뭐 먹지?",
      description: "토너먼트로 음식을 결정해보세요",
      url: "https://hunger-game.pages.dev/",
      emoji: "🍽️",
    },
  ];

  // 탭 레이아웃 계산 (한 줄에 최대 2개, 긴 텍스트는 한 줄에)
  const getTabLayout = () => {
    const layout = [];
    let currentRow = [];

    tabs.forEach((tab) => {
      // 텍스트가 긴 경우 (12자 이상) 한 줄에 배치
      if (tab.label.length > 12) {
        if (currentRow.length > 0) {
          layout.push([...currentRow]);
          currentRow = [];
        }
        layout.push([tab]);
      } else {
        currentRow.push(tab);
        if (currentRow.length === 2) {
          layout.push([...currentRow]);
          currentRow = [];
        }
      }
    });

    if (currentRow.length > 0) {
      layout.push(currentRow);
    }

    return layout;
  };

  // 홈 화면 렌더링
  const renderHomeScreen = () => {
    const tabLayout = getTabLayout();

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.homeContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.natureText}>🌿 Nature</Text>
              <Text style={styles.playgroundText}>Playground 🦋</Text>
            </View>
            <Text style={styles.subtitle}>Nature와 함께하는 즐거운 공간</Text>
          </View>

          {/* 탭 그리드 */}
          <View style={styles.tabGrid}>
            {tabLayout.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.tabRow}>
                {row.map((tab) => (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.tabCard,
                      row.length === 1
                        ? styles.fullWidthCard
                        : styles.halfWidthCard,
                    ]}
                    onPress={() => setCurrentScreen(tab.key)}>
                    <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                    <Text style={styles.tabLabel}>{tab.label}</Text>
                    <Text style={styles.tabDescription}>{tab.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* 장식 요소 */}
          <View style={styles.decorativeElements}>
            <Text style={styles.decorativeText}>🌸 🌺 🌻 🌷</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // 웹뷰 화면 렌더링
  const renderWebViewScreen = () => {
    const currentTab = tabs.find((tab) => tab.key === currentScreen);

    return (
      <SafeAreaView style={styles.container}>
        {/* 상단 네비게이션 */}
        <View style={styles.navigationHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen("home")}>
            <Text style={styles.backButtonText}>← 홈</Text>
          </TouchableOpacity>
          <Text style={styles.navigationTitle}>{currentTab?.label}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 위치 정보 상태 표시 */}
        {currentScreen === "lunch" && (
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

        {/* WebView */}
        <WebView
          source={{ uri: currentTab?.url }}
          style={styles.webview}
          key={currentTab?.url}
        />
      </SafeAreaView>
    );
  };

  // 현재 화면에 따라 렌더링
  if (currentScreen === "home") {
    return renderHomeScreen();
  } else {
    return renderWebViewScreen();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fffe",
  },
  homeContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  natureText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2d5016",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  playgroundText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4a7c59",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b8e5a",
    fontWeight: "500",
    textAlign: "center",
  },
  tabGrid: {
    flex: 1,
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  tabCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e8f5e8",
    minHeight: 120,
  },
  halfWidthCard: {
    width: (width - 56) / 2, // 20 padding * 2 + 16 gap
  },
  fullWidthCard: {
    width: width - 40, // 20 padding * 2
  },
  tabEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  tabLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d5016",
    textAlign: "center",
    marginBottom: 4,
  },
  tabDescription: {
    fontSize: 12,
    color: "#6b8e5a",
    textAlign: "center",
  },
  decorativeElements: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  decorativeText: {
    fontSize: 24,
    opacity: 0.6,
  },
  navigationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8f5e8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#4a7c59",
    fontWeight: "600",
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d5016",
  },
  placeholder: {
    width: 50, // backButton과 같은 너비로 중앙 정렬
  },
  locationStatus: {
    backgroundColor: "#e8f5e8",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#d0e7d0",
  },
  locationText: {
    fontSize: 12,
    color: "#4a7c59",
    textAlign: "center",
  },
  webview: {
    flex: 1,
  },
});
