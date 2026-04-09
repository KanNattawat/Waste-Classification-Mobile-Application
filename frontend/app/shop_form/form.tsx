import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import { Stack, useRouter } from 'expo-router';
// 1. เพิ่ม Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const RecyclingForm = () => {
    const mapRef = useRef(null);
    const isProgrammatic = useRef(false);
    const router = useRouter();

    // 2. เปลี่ยนจาก const currentUserId = 1; เป็น State
    const [currentUserId, setCurrentUserId] = useState(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const [region, setRegion] = useState({
        latitude: 13.7367,
        longitude: 100.5231,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const [selectedCategories, setSelectedCategories] = useState([]);

    // 3. ใช้ useEffect เพื่อดึง userId จาก AsyncStorage เมื่อเปิดหน้านี้
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedId = await AsyncStorage.getItem('userId'); // ตรวจสอบชื่อ Key ให้ตรงกับตอนที่เซฟ Login นะครับ
                if (storedId !== null) {
                    setCurrentUserId(Number(storedId));
                }
            } catch (error) {
                console.error('Error fetching userId:', error);
            }
        };

        fetchUserId();
    }, []);

    const toggleCategory = (id) => {
        setSelectedCategories((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const categories = [
        { id: 1, label: 'กระดาษ', icon: 'file-document-outline' },
        { id: 2, label: 'พลาสติก', icon: 'bottle-wine-outline' },
        { id: 3, label: 'โลหะ', icon: 'nut' },
        { id: 4, label: 'แก้ว', icon: 'glass-wine' },
        { id: 5, label: 'e-waste', icon: 'battery-charging' },
        { id: 6, label: 'อื่นๆ', icon: 'dots-horizontal' },
    ];

    const onSubmit = async () => {
        // 4. เพิ่มการตรวจสอบว่าพบ userId หรือไม่ก่อนกดส่งข้อมูล
        if (!currentUserId) {
            Alert.alert("เกิดข้อผิดพลาด", "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
            return;
        }

        if (!name.trim() || !phone.trim()) {
            Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อและเบอร์โทรศัพท์");
            return;
        }
        if (selectedCategories.length === 0) {
            Alert.alert("ข้อมูลไม่ครบ", "กรุณาเลือกหมวดหมู่ขยะ");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                user_id: currentUserId,
                shop_name: name,
                tel_num: phone,
                location: [region.latitude, region.longitude],
                accepted_cate: selectedCategories
            };

            const response = await axios.post(
                'https://waste-classification-mobile-application.onrender.com/recycle-shop',
                payload
            );

            if (response.status === 200 || response.status === 201) {
                Alert.alert("สำเร็จ", "เพิ่มข้อมูลเรียบร้อย", [
                    { text: "ตกลง", onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.log(error);
            Alert.alert("ผิดพลาด", "บันทึกไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            enableOnAndroid
            keyboardShouldPersistTaps="handled"
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Icon name="arrow-left" size={28} color="#108a74" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>แบบฟอร์มกรอกข้อมูลจุดรับซื้อ</Text>
                </View>

                {/* Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ชื่อ</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="ชื่อร้าน / ชื่อผู้ติดต่อ"
                    />

                    <Text style={styles.label}>เบอร์โทร</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        placeholder="0xxxxxxxxx"
                    />
                </View>

                {/* 🔍 Search */}
                <Text style={styles.label}>ค้นหาตำแหน่ง</Text>
                <View style={styles.searchContainerWrapper}>
                    <GooglePlacesAutocomplete
                        placeholder="ค้นหาตำแหน่ง"
                        fetchDetails
                        keyboardShouldPersistTaps="handled"
                        enablePoweredByContainer={false}
                        disableScroll={true}

                        onPress={(data, details = null) => {
                            if (details?.geometry?.location) {
                                const newRegion = {
                                    latitude: details.geometry.location.lat,
                                    longitude: details.geometry.location.lng,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                };

                                isProgrammatic.current = true;
                                setRegion(newRegion);

                                if (mapRef.current) {
                                    mapRef.current.animateToRegion(newRegion, 800);
                                }
                            }
                        }}

                        query={{
                            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                            language: 'th',
                            components: 'country:th',
                        }}

                        styles={{
                            container: styles.searchContainer,
                            textInput: styles.searchInput,
                            listView: {
                                borderRadius: 8,
                                backgroundColor: '#fff',
                                elevation: 5,
                                zIndex: 999,
                            },
                        }}
                    />
                </View>

                {/* 🗺 Map */}
                <Text style={styles.label}>เลือกตำแหน่งที่ตั้ง</Text>
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        region={region}
                        showsUserLocation
                        onRegionChangeComplete={(r) => {
                            if (isProgrammatic.current) {
                                isProgrammatic.current = false;
                                return;
                            }
                            setRegion(r);
                        }}
                    >
                        <Marker coordinate={region} />
                    </MapView>
                </View>

                {/* Category */}
                <Text style={styles.label}>หมวดหมู่ของที่รับ</Text>
                <View style={styles.categoryBox}>
                    <View style={styles.categoryGrid}>
                        {categories.map((item) => {
                            const isSelected = selectedCategories.includes(item.id);

                            return (
                                <View key={item.id} style={styles.categoryItem}>
                                    <TouchableOpacity
                                        style={[
                                            styles.circleIcon,
                                            isSelected && styles.circleIconSelected,
                                        ]}
                                        onPress={() => toggleCategory(item.id)}
                                    >
                                        <Icon
                                            name={item.icon}
                                            size={30}
                                            color={isSelected ? '#fff' : '#555'}
                                        />
                                    </TouchableOpacity>

                                    <Text
                                        style={[
                                            styles.categoryLabel,
                                            isSelected && styles.categoryLabelSelected,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={onSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>ยืนยัน</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    backButton: {
        marginRight: 10,
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#108a74',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#a5d6a7',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        height: 45,
    },
    searchContainerWrapper: {
        zIndex: 20,
        marginBottom: 15,
    },
    searchContainer: {
        flex: 0,
        width: '100%',
    },
    searchInput: {
        height: 45,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 14,
        backgroundColor: '#fff',
    },
    mapContainer: {
        height: 250,
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20,
        zIndex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    categoryBox: {
        borderWidth: 1,
        borderColor: '#c8e6c9',
        borderRadius: 15,
        padding: 15,
        marginBottom: 30,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 15,
    },
    circleIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    circleIconSelected: {
        backgroundColor: '#1b8a74',
    },
    categoryLabel: {
        fontSize: 12,
        color: '#333',
    },
    categoryLabelSelected: {
        color: '#1b8a74',
        fontWeight: 'bold',
    },
    submitBtn: {
        backgroundColor: '#1b8a74',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 50,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RecyclingForm;