import {  Text, View } from 'react-native';

const ProgressBar = ({ label, percent, color }: { label: string, percent: number, color: string }) => {
  return (
    <View className="bg-white p-4 rounded-lg mb-[15px] shadow-md">
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-xl text-gray-800">{label}</Text>
        <Text className="text-xl font-medium text-gray-800">{percent.toFixed(1)}%</Text>
      </View>

      <View className="h-3 bg-gray-300 rounded-full overflow-hidden">
        <View
          style={{ width: `${percent}%` }}
          className={`h-full rounded-full ${color}`}
        />
      </View>
    </View>
  );
};

export default ProgressBar;