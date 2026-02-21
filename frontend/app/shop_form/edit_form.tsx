import React, { useState, useEffect } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const EditShopScreen = () => {
    const router = useRouter(); 
    const { shopId } = useLocalSearchParams(); // ✅ รับ shopId มาจากหน้าที่แล้ว
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [shopStatus, setShopStatus] = useState(null); // เก็บสถานะร้าน

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [region, setRegion] = useState({
        latitude: 13.7367,
        longitude: 100.5231,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const categories = [
        { id: 1, label: 'กระดาษ', icon: 'file-document-outline' },
        { id: 2, label: 'พลาสติก', icon: 'bottle-wine-outline' },
        { id: 3, label: 'โลหะ', icon: 'nut' },
        { id: 4, label: 'แก้ว', icon: 'glass-wine' },
        { id: 5, label: 'e-waste', icon: 'battery-charging' },
        { id: 6, label: 'อื่นๆ', icon: 'dots-horizontal' },
    ];

    // ✅ ฟังก์ชันสำหรับดึงข้อมูลร้านจาก API โดยใช้ shopId
    const fetchShopData = async () => {
        if (!shopId) {
            Alert.alert("ผิดพลาด", "ไม่พบรหัสร้านที่ต้องการแก้ไข");
            router.back();
            return;
        }

        try {
            // ไปดึงข้อมูลร้านมาจาก DB (สมมติว่าเป็น userId = 1 ตามหน้าเก่า)
            // หมายเหตุ: API เส้นนี้อาจจะต้องเปลี่ยนถ้ามีเส้นดึงร้านโดยใช้ ID ตรงๆ
            const response = await axios.get(`https://waste-classification-mobile-application.onrender.com/recycle-shop2?userId=1`);
            
            // หาข้อมูลร้านที่ตรงกับ shopId ที่ส่งมา
            const currentShop = response.data.find(shop => String(shop.Shop_ID) === String(shopId));

            if (currentShop) {
                setName(currentShop.Shop_name || '');
                setPhone(currentShop.Tel_num || '');
                setSelectedCategories(currentShop.Accepted_cate || []);
                setShopStatus(currentShop.Status);

                if (currentShop.Location && currentShop.Location.length === 2) {
                    setRegion({
                        latitude: currentShop.Location[0],
                        longitude: currentShop.Location[1],
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    });
                }
            } else {
                Alert.alert("ผิดพลาด", "ไม่พบข้อมูลร้านในระบบ");
                router.back();
            }
        } catch (error) {
            console.error("Error fetching shop data:", error);
            Alert.alert("ผิดพลาด", "ไม่สามารถดึงข้อมูลร้านได้");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShopData();
    }, [shopId]);


    const toggleCategory = (id) => {
        setSelectedCategories((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const onUpdate = async () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อและเบอร์โทรศัพท์");
            return;
        }
        if (selectedCategories.length === 0) {
            Alert.alert("ข้อมูลไม่ครบ", "กรุณาเลือกหมวดหมู่ขยะอย่างน้อย 1 ประเภท");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                shop_name: name,
                tel_num: phone,
                location: [region.latitude, region.longitude],
                accepted_cate: selectedCategories
            };
            
            const API_URL = `https://waste-classification-mobile-application.onrender.com/update_recycle-shop/${shopId}`; 

            const response = await axios.put(API_URL, payload);

            if (response.status === 200) {
                Alert.alert("สำเร็จ", "แก้ไขข้อมูลร้านเรียบร้อยแล้ว", [
                    {
                        text: "ตกลง",
                        onPress: () => router.back()
                    }
                ]);
            }
        } catch (error) {
            console.log('Update error:', error);
            const errorMessage = error.response?.data?.error || "ไม่สามารถแก้ไขข้อมูลได้ กรุณาลองใหม่อีกครั้ง";
            Alert.alert("เกิดข้อผิดพลาด", errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#108a74" />
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            enableOnAndroid
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.headerText}>แก้ไขข้อมูลร้าน</Text>
            
            <View style={styles.statusContainer}>
                 <Text style={styles.label}>สถานะร้าน: </Text>
                 <Text style={{ color: shopStatus ? 'green' : 'orange', fontWeight: 'bold' }}>
                     {shopStatus ? 'เปิดใช้งาน' : 'รอการตรวจสอบ/ปิดใช้งาน'}
                 </Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>ชื่อร้าน / ผู้ติดต่อ</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="ชื่อร้าน"
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

            <Text style={styles.label}>ตำแหน่งที่ตั้ง (ลากหมุดเพื่อแก้ไข)</Text>
            <View style={styles.mapContainer}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={region}
                >
                    <Marker 
                        coordinate={region} 
                        draggable 
                        onDragEnd={(e) => {
                            setRegion({
                                ...region,
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude,
                            });
                        }}
                    />
                </MapView>

                {/* ⚠️ อย่าลืมใส่ API Key ของคุณตรงนี้นะครับ */}
                <GooglePlacesAutocomplete
                    placeholder="ค้นหาเพื่อเปลี่ยนตำแหน่ง..."
                    fetchDetails
                    onPress={(data, details = null) => {
                        const location = details.geometry.location;
                        setRegion({
                            latitude: location.lat,
                            longitude: location.lng,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        });
                    }}
                    query={{
                        key: 'YOUR_GOOGLE_MAPS_API_KEY', 
                        language: 'th',
                        components: 'country:th',
                    }}
                    styles={{
                        container: styles.searchContainer,
                        textInput: styles.searchInput,
                        listView: { borderRadius: 8 },
                    }}
                />
            </View>

            <Text style={styles.label}>หมวดหมู่ของที่รับ (เลือกที่ต้องการแก้ไข)</Text>
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
                                        color={isSelected ? '#fff' : '#108a74'}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.categoryText}>{item.label}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
                onPress={onUpdate}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveBtnText}>บันทึกการแก้ไข</Text>
                )}
            </TouchableOpacity>

        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    headerText: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    statusContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
    inputGroup: { marginBottom: 15 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fafafa' },
    mapContainer: { height: 250, width: '100%', borderRadius: 8, overflow: 'hidden', marginBottom: 20 },
    map: { ...StyleSheet.absoluteFillObject },
    searchContainer: { position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1 },
    searchInput: { height: 44, borderRadius: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ddd', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    categoryBox: { marginBottom: 30 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
    categoryItem: { width: '30%', alignItems: 'center', marginBottom: 15 },
    circleIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    circleIconSelected: { backgroundColor: '#108a74' },
    categoryText: { fontSize: 14, color: '#333' },
    saveBtn: { backgroundColor: '#108a74', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 40 },
    saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default EditShopScreen;