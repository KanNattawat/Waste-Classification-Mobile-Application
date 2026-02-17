import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width } = Dimensions.get('window');

const RecyclingForm = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const [region, setRegion] = useState({
        latitude: 13.7367,
        longitude: 100.5231,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    // ✅ state สำหรับ checkbox หมวดหมู่
    const [selectedCategories, setSelectedCategories] = useState([]);

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

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            enableOnAndroid
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.headerText}>แบบฟอร์มกรอกข้อมูลจุดรับซื้อ</Text>

            {/* ข้อมูลส่วนตัว */}
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

            {/* แผนที่ */}
            <Text style={styles.label}>เลือกตำแหน่งที่ตั้ง</Text>
            <View style={styles.mapContainer}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={region}
                    showsUserLocation
                >
                    <Marker coordinate={region} />
                </MapView>

                <GooglePlacesAutocomplete
                    placeholder="ค้นหาตำแหน่ง"
                    fetchDetails
                    onPress={(data, details = null) => {
                        const location = details.geometry.location;
                        setRegion({
                            latitude: location.lat,
                            longitude: location.lng,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        });
                    }}
                    query={{
                        key: 'AIzaSyDOTi8DE-fCsrIPvkHXwuB0Aq_qkffvq-c',
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

            {/* ปุ่มยืนยัน */}
            <TouchableOpacity style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>ยืนยัน</Text>
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#108a74',
        marginBottom: 20,
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

    /* Map */
    mapContainer: {
        height: 250,
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20,
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
        height: 45,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 14,
    },

    /* Categories */
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

    /* Submit */
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
