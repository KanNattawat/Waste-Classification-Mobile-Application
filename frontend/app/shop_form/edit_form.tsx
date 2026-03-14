import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    ActivityIndicator, 
    ScrollView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

// กำหนด Base URL ของ API
const API_BASE_URL = 'https://waste-classification-mobile-application.onrender.com';

export default function EditShopScreen() {
    const { shopId } = useLocalSearchParams(); // รับค่า shopId ที่ส่งมาจากหน้าก่อน
    const router = useRouter();

    // ----------------------------------------
    // 1. States สำหรับเก็บข้อมูลฟอร์ม
    // ----------------------------------------
    const [shopName, setShopName] = useState('');
    const [telNum, setTelNum] = useState('');
    const [acceptedCate, setAcceptedCate] = useState(''); 
    const [location, setLocation] = useState(null);

    // States สำหรับจัดการสถานะ Loading ต่างๆ
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // ----------------------------------------
    // 2. ฟังก์ชันโหลดข้อมูลร้านค้า (เมื่อเปิดหน้าต่าง)
    // ----------------------------------------
    useEffect(() => {
        const fetchShopData = async () => {
            if (!shopId) {
                Alert.alert("ข้อผิดพลาด", "ไม่พบรหัสร้านค้า");
                router.back();
                return;
            }

            try {
                // สมมติว่า userId คือ 1 (ปรับให้ตรงกับระบบ Auth ของคุณ)
                const response = await axios.get(`${API_BASE_URL}/recycle-shop2?userId=1`);
                
                if (response.status === 200 && response.data) {
                    // ค้นหาร้านที่ตรงกับ shopId
                    const shopData = response.data.find(shop => shop.Shop_ID === Number(shopId));
                    
                    if (shopData) {
                        setShopName(shopData.shop_name);
                        setTelNum(shopData.tel_num);
                        setAcceptedCate(shopData.accepted_cate);
                        setLocation(shopData.location);
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

    // ----------------------------------------
    // 3. ฟังก์ชันอัปเดตข้อมูล (Update)
    // ----------------------------------------
    const onUpdate = async () => {
        // Validation เบื้องต้น
        if (!shopName.trim() || !telNum.trim() || !acceptedCate) {
            Alert.alert("ข้อมูลไม่ครบถ้วน", "กรุณากรอกชื่อร้าน เบอร์โทร และหมวดหมู่ให้ครบถ้วน");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                shop_name: shopName,
                tel_num: telNum,
                accepted_cate: acceptedCate,
                location: location
            };

            const response = await axios.put(`${API_BASE_URL}/update_recycle-shop/${shopId}`, payload);

            if (response.status === 200) {
                Alert.alert("สำเร็จ", "แก้ไขข้อมูลร้านเรียบร้อยแล้ว", [
                    { text: "ตกลง", onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.error("Update error:", error);
            const errorMessage = error.response?.data?.error || "ไม่สามารถอัปเดตข้อมูลได้";
            Alert.alert("เกิดข้อผิดพลาด", errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // ----------------------------------------
    // 4. ฟังก์ชันลบข้อมูล (Delete)
    // ----------------------------------------
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
            const response = await axios.delete(`${API_BASE_URL}/delete_recycle-shop/${shopId}`);

            if (response.status === 200) {
                Alert.alert("สำเร็จ", "ลบร้านรับซื้อเรียบร้อยแล้ว", [
                    { text: "ตกลง", onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.error("Delete error:", error);
            const errorMessage = error.response?.data?.error || "ไม่สามารถลบข้อมูลได้";
            Alert.alert("เกิดข้อผิดพลาด", errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    // ----------------------------------------
    // 5. UI Rendering
    // ----------------------------------------
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#108a74" />
                <Text style={{ marginTop: 10 }}>กำลังโหลดข้อมูล...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.headerTitle}>แก้ไขข้อมูลร้านรับซื้อ</Text>

            {/* ส่วนกรอกข้อมูล */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>ชื่อร้าน</Text>
                <TextInput 
                    style={styles.input}
                    value={shopName}
                    onChangeText={setShopName}
                    placeholder="ระบุชื่อร้าน"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>เบอร์โทรศัพท์</Text>
                <TextInput 
                    style={styles.input}
                    value={telNum}
                    onChangeText={setTelNum}
                    placeholder="ระบุเบอร์โทรศัพท์"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>หมวดหมู่ที่รับซื้อ</Text>
                <TextInput 
                    style={styles.input}
                    value={acceptedCate}
                    onChangeText={setAcceptedCate}
                    placeholder="เช่น กระดาษ, พลาสติก, โลหะ"
                />
                {/* หมายเหตุ: หากคุณมี Dropdown Picker ให้เอามาใส่แทน TextInput ตรงนี้นะครับ */}
            </View>

            {/* ส่วนแผนที่ (จำลอง) */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>ตำแหน่งที่ตั้ง (Map)</Text>
                <View style={styles.mapPlaceholder}>
                    <Text style={{color: '#888'}}>พื้นที่สำหรับแสดงแผนที่ (Map Component)</Text>
                    {/* นำ <MapView> ของคุณมาใส่ตรงนี้ */}
                </View>
            </View>

            {/* ปุ่ม Action */}
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
                    onPress={onUpdate}
                    disabled={saving || deleting}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>บันทึกแก้ไข</Text>
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
                        <Text style={styles.deleteBtnText}>ลบร้าน</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// ----------------------------------------
// 6. Styles
// ----------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#444',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    mapPlaceholder: {
        height: 150,
        backgroundColor: '#e9e9e9',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        marginBottom: 40,
    },
    saveBtn: {
        flex: 1,
        backgroundColor: '#108a74', // สีเขียวเซฟ
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteBtn: {
        flex: 1,
        backgroundColor: '#e74c3c', // สีแดงลบ
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 8,
    },
    deleteBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});