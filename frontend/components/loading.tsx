import { View, Image, Text } from 'react-native'
// import earth from '@/assets/images/earth.png'

const Loading = () => {
    return (
        <View className='flex items-center'>
            <Image source={require('@/assets/images/earth.png')} className='' />
            <View className='flex-row pt-8 items-center'>
                    <Text className='text-[#4C944C] text-2xl font-bold mr-2 mt-6'>Loading</Text>
                    <Text className='text-[#4C944C] text-6xl font-bold animate-bounce'>.</Text>
                    <Text className='text-[#4C944C] text-6xl font-bold animate-bounce'>.</Text>
                    <Text className='text-[#4C944C] text-6xl font-bold animate-bounce'>.</Text>
            </View>
        </View>
    )
}

export default Loading
