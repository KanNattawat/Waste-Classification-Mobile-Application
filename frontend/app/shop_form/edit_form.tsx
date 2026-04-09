import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import axios from 'axios';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API_URL } from "@/config";

const { width } = Dimensions.get('window');

export default function EditShopScreen() {
    const { shopId } = useLocalSearchParams();
    const router = useRouter();

    const [shopName, setShopName] = useState('');
    const [telNum, setTelNum] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [region, setRegion] = useState({
        latitude: 13.7367,
        longitude: 100.5231,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const mapRef = useRef(null);
    const isProgrammatic = useRef(false);

    const categories = [
        { id: 1, label: 'กระดาษ', icon: 'file-document-outline' },
        { id: 2, label: 'พลาสติก', icon: 'bottle-wine-outline' },
        { id: 3, label: 'โลหะ', icon: 'nut' },
        { id: 4, label: 'แก้ว', icon: 'glass-wine' },
        { id: 5, label: 'e-waste', icon: 'battery-charging' },
        { id: 6, label: 'อื่นๆ', icon: 'dots-horizontal' },
    ];

    const toggleCategory = (id) => {
        setSelectedCategories((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    useEffect(() => {
        const fetchShopData = async () => {
            if (!shopId) {
                Alert.alert("ข้อผิดพลาด", "ไม่พบรหัสร้านค้า");
                router.back();
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/recycle-shop2?userId=1`);

                if (response.status === 200 && response.data) {
                    const shopData = response.data.find(shop => String(shop.Shop_ID) === String(shopId));

                    if (shopData) {
                        setShopName(shopData.Shop_name || shopData.shop_name || '');
                        setTelNum(shopData.Tel_num || shopData.tel_num || '');

                        const loc = shopData.Location || shopData.location;
                        if (loc && Array.isArray(loc) && loc.length >= 2) {
                            setRegion({
                                latitude: parseFloat(loc[0]),
                                longitude: parseFloat(loc[1]),
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            });
                        }

                        const ac = shopData.Accepted_cate || shopData.accepted_cate;
                        if (Array.isArray(ac)) {
                            let parsedCats = [];
                            ac.forEach(item => {
                                if (typeof item === 'number') parsedCats.push(item);
                                else if (typeof item === 'string') {
                                    const matched = categories.find(c => c.label === item);
                                    if (matched) parsedCats.push(matched.id);
                                }
                            });
                            setSelectedCategories(parsedCats);
                        } else if (typeof ac === 'string') {
                            let parsedCats = [];
                            const parts = ac.split(',').map(s => s.trim());
                            parts.forEach(p => {
                                const matched = categories.find(c => c.label === p);
                                if (matched) parsedCats.push(matched.id);
                                else if (!isNaN(parseInt(p))) parsedCats.push(parseInt(p));
                            });
                            setSelectedCategories(parsedCats);
                        }

                    } else {
                        Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลร้านค้านี้ในระบบ");
                        router.back();
                    }
                }
            } catch (error) {
                console.error("Fetch shop error:", error);
                Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลร้านค้าได้");
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, [shopId]);

    const onUpdate = async () => {
        if (!shopName.trim() || !telNum.trim()) {
            Alert.alert("ข้อมูลไม่ครบถ้วน", "กรุณากรอกชื่อร้านและเบอร์โทรศัพท์ให้ครบถ้วน");
            return;
        }
        if (selectedCategories.length === 0) {
            Alert.alert("ข้อมูลไม่ครบ", "กรุณาเลือกหมวดหมู่ขยะอย่างน้อย 1 ประเภท");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                shop_name: shopName,
                tel_num: telNum,
                location: [region.latitude, region.longitude],
                accepted_cate: selectedCategories
            };

            const response = await axios.put(`${API_URL}/update_recycle-shop/${shopId}`, payload);

            if (response.status === 200) {
                Alert.alert("สำเร็จ", "แก้ไขข้อมูลร้านเรียบร้อยแล้ว", [
                    { text: "ตกลง", onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.error("Update error:", error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตข้อมูลได้");
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = () => {
        Alert.alert(
            "ยืนยันการลบ",
            "คุณแน่ใจหรือไม่ว่าต้องการลบร้านรับซื้อนี้? หากลบแล้วจะไม่สามารถกู้คืนได้",
            [
                { text: "ยกเลิก", style: "cancel" },
                { text: "ลบทิ้ง", style: "destructive", onPress: onDeleteShop }
            ]
        );
    };

    const onDeleteShop = async () => {
        setDeleting(true);
        try {
            const response = await axios.delete(`${API_URL}/delete_recycle-shop/${shopId}`);

            if (response.status === 200) {
                Alert.alert("สำเร็จ", "ลบร้านรับซื้อเรียบร้อยแล้ว", [
                    { text: "ตกลง", onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.error("Delete error:", error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูลได้");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#108a74" />
                <Text style={{ marginTop: 10 }}>กำลังโหลดข้อมูล...</Text>
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={styles.containerContent}
            enableOnAndroid
            keyboardShouldPersistTaps="handled"
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Icon name="arrow-left" size={28} color="#108a74" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>แก้ไขข้อมูลร้านรับซื้อ</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ชื่อร้าน / ชื่อผู้ติดต่อ</Text>
                    <TextInput
                        style={styles.input}
                        value={shopName}
                        onChangeText={setShopName}
                        placeholder="ระบุชื่อร้าน"
                    />

                    <Text style={styles.label}>เบอร์โทร</Text>
                    <TextInput
                        style={styles.input}
                        value={telNum}
                        onChangeText={setTelNum}
                        keyboardType="phone-pad"
                        placeholder="0xxxxxxxxx"
                    />
                </View>

                <Text style={styles.label}>ค้นหาตำแหน่งใหม่ (ถ้าต้องการเปลี่ยน)</Text>
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
                                borderRadius: 10,
                                backgroundColor: '#fff',
                                elevation: 5,
                                zIndex: 999,
                            },
                        }}
                    />
                </View>

                {/* แผนที่ */}
                <Text style={styles.label}>ตำแหน่งที่ตั้งบนแผนที่</Text>
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

                {/* หมวดหมู่ */}
                <Text style={styles.label}>หมวดหมู่ของที่รับซื้อ</Text>
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
                                        activeOpacity={0.8}
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


                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                        onPress={onUpdate}
                        disabled={saving || deleting}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.btnText}>บันทึกแก้ไข</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.deleteBtn, deleting && { opacity: 0.7 }]}
                        onPress={confirmDelete}
                        disabled={saving || deleting}
                    >
                        {deleting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.btnText}>ลบร้าน</Text>
                        )}
                    </TouchableOpacity>
                </View>

            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerContent: {
        padding: 20,
        paddingBottom: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
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
        backgroundColor: '#fff',
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
        borderColor: '#a5d6a7',
        fontSize: 14,
        backgroundColor: '#fff',
    },
    mapContainer: {
        height: 250,
        width: '100%',
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
        zIndex: 1,
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
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        zIndex: 1,
    },
    saveBtn: {
        flex: 1,
        backgroundColor: '#108a74',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginRight: 8,
    },
    deleteBtn: {
        flex: 1,
        backgroundColor: '#e74c3c',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginLeft: 8,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});