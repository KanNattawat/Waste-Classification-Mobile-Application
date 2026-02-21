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

const { width } = Dimensions.get('window');

// ✅ รับ prop route และ navigation เข้ามา
const EditShopScreen = ({ route, navigation }) => {
    // สมมติว่าส่งข้อมูลร้านที่ต้องการแก้ไขมาทาง route params ชื่อ 'shopData'
    // ตัวอย่างการ navigate มาหน้านี้: navigation.navigate('EditShop', { shopData: item });
    const shopData = route.params?.shopData;

    const [loading, setLoading] = useState(true); // โหลดข้อมูลเริ่มต้น
    const [saving, setSaving] = useState(false); // กำลังบันทึก

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

    // ✅ useEffect เพื่อกำหนดค่าเริ่มต้นจาก shopData ที่ส่งเข้ามา
    useEffect(() => {
        if (shopData) {
            setName(shopData.Shop_name || '');
            setPhone(shopData.Tel_num || '');
            setSelectedCategories(shopData.Accepted_cate || []);

            if (shopData.Location && shopData.Location.length === 2) {
                setRegion({
                    latitude: shopData.Location[0],
                    longitude: shopData.Location[1],
                    latitudeDelta: 0.005, // ซูมเข้ามาหน่อยให้เห็นจุดชัดๆ
                    longitudeDelta: 0.005,
                });
            }
        } else {
            Alert.alert("ผิดพลาด", "ไม่พบข้อมูลร้านที่ต้องการแก้ไข");
            navigation.goBack();
        }
        setLoading(false);
    }, [shopData]);


    const toggleCategory = (id) => {
        setSelectedCategories((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    // ✅ ฟังก์ชันสำหรับอัปเดตข้อมูล (ใช้ PUT)
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
            // Payload สำหรับการอัปเดต
            const payload = {
                shop_name: name,
                tel_num: phone,
                location: [region.latitude, region.longitude],
                accepted_cate: selectedCategories
            };
            
            // ใส่ IP Address หรือ URL ของ Backend คุณ
            const API_URL = `https://waste-classification-mobile-application.onrender.com/update_recycle-shop/${shopData.Shop_ID}`; 

            // ใช้ axios.put
            const response = await axios.put(API_URL, payload);

            if (response.status === 200) {
                Alert.alert("สำเร็จ", "แก้ไขข้อมูลร้านเรียบร้อยแล้ว", [
                    {
                        text: "ตกลง",
                        onPress: () => {
                            // อาจจะส่ง params กลับไปบอกหน้าก่อนหน้าว่าให้ refresh ข้อมูล
                            navigation.goBack(); 
                        }
                    }
                ]);
            }
        } catch (error) {
            console.log('Update error:', error);
             // แสดง error ที่ชัดเจนขึ้นถ้า backend ส่งมา
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
            {/* Header อาจจะใส่ปุ่ม Back หรือเปลี่ยน Title */}
            <Text style={styles.headerText}>แก้ไขข้อมูลร้าน</Text>
            
            {/* แสดงสถานะ (ถ้าต้องการ) */}
            <View style={styles.statusContainer}>
                 <Text style={styles.label}>สถานะร้าน: </Text>
                 <Text style={{ color: shopData?.Status ? 'green' : 'orange', fontWeight: 'bold' }}>
                     {shopData?.Status ? 'เปิดใช้งาน' : 'รอการตรวจสอบ/ปิดใช้งาน'}
                 </Text>
            </View>


            {/* ข้อมูลพื้นฐาน */}
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

            {/* แผนที่ - เพิ่ม draggable เพื่อให้ลากหมุดแก้ไขตำแหน่งได้ละเอียดขึ้น */}
            <Text style={styles.label}>ตำแหน่งที่ตั้ง (ลากหมุดเพื่อแก้ไข)</Text>
            <View style={styles.mapContainer}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={region}
                    // onRegionChangeComplete={setRegion} // เอาอันนี้ออกถ้าไม่อยากให้ map ขยับตามตอนพิมพ์ search
                >
                    <Marker 
                        coordinate={region} 
                        draggable // ✅ ทำให้หมุดลากได้
                        onDragEnd={(e) => {
                            // ✅ อัปเดต state เมื่อลากหมุดเสร็จ
                            setRegion({
                                ...region,
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude,
                            });
                        }}
                    />
                </MapView>

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
                        key: 'YOUR_GOOGLE_MAPS_API_KEY', // ⚠️ ใส่ API Key ของคุณ
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

            {/* หมวดหมู่ */}
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

            {/* ปุ่มบันทึกการแก้ไข */}
            <View style={styles.buttonGroup}>
                {/* ปุ่มยกเลิก */}
                 <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={() => navigation.goBack()}
                    disabled={saving}
                >
                    <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                </TouchableOpacity>

                {/* ปุ่มบันทึก */}
                <TouchableOpacity 
                    style={[styles.submitBtn, saving && { opacity: 0.7 }]} 
                    onPress={onUpdate}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>บันทึกการแก้ไข</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    );
};

// Styles (นำมาจากของเดิม และเพิ่มเติมเล็กน้อย)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#108a74',
        marginBottom: 15,
    },
    statusContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
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
        color: '#000',
    },
    mapContainer: {
        height: 250,
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    searchContainer: {
        position: 'absolute',
        top: 10,
        width: '90%',
        alignSelf: 'center',
        zIndex: 10,
    },
    searchInput: {
        height: 40,
        borderRadius: 8,
        borderWidth: 0,
        backgroundColor: '#fff',
        elevation: 3, // เงาสำหรับ Android
        shadowColor: '#000', // เงาสำหรับ iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
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
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 50,
    },
    cancelBtn: {
        flex: 0.45,
        backgroundColor: '#ccc',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitBtn: {
        flex: 0.45,
        backgroundColor: '#1b8a74',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default EditShopScreen;