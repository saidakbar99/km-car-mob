// app/dashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Button } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCars, fetchHistory, createEntry, updateEntry, removeEntry } from '../scripts/api';
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { formatISODate, formatDate } from '../scripts/utils'

import dayjs from "dayjs";
import { useNavigation } from "@react-navigation/native";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/ru";

dayjs.extend(customParseFormat);
dayjs.extend(localeData);
dayjs.locale("ru");

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [history, setHistory] = useState([]);
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState<{
    id: string;
    staff_last_name: string;
    staff_first_name: string;
    number: string;
  } | null>(null);
  const [action, setAction] = useState('entry');
  const [selectedEntry, setSelectedEntry] = useState<
    { 
      staff_last_name: string;
      staff_first_name: string;
      number: string;
      action: string;
      date: string;
      comes_id: string
    } | null
  >(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        //@ts-ignore
        navigation.navigate('index');
        // window.location.href = '/';
      } else {
        getCarsList();
        getHistory();
      }
    };
    
    checkToken();

    return () => {
      setHistory([]);
      setCars([]);
    };
  }, []);

  const getCarsList = async () => {
    try {
      const response = await fetchCars();
      setCars(response.data.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Moshinalar ro‘yhatini yuklashda xatolik!',
      });
      console.error('Error fetching data:', error);
    }
  };

  const getHistory = async () => {
    try {
      const response = await fetchHistory("01-01-2025", "02-02-2029");
      const filteredHistory = response.data.filter((item:any) => item.hasOwnProperty("action"));
      //@ts-ignore
      const sortedHistory = filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(sortedHistory);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Kirib-chiqish tarixini yuklashda xatolik!',
      });
      console.error('Error fetching data:', error);
    }
  };

  const createNewEntry = async (car:any) => {
    const carData = {
      car_id: car.id,
      action_type: action,
      datetime: formatISODate(),
    };
    try {
      await createEntry(carData);
      setSelectedCar(null);
      getHistory();
      Toast.show({
        type: 'success',
        text1: 'Muvaffaqiyatli yaratildi!',
      });
    } catch (error) {
      console.error('Error creating data:', error);
      Toast.show({
        type: 'error',
        text1: 'Xatolik yuz berdi, qayta urining!',
      });
    }
  };

  const editEntry = async (entry:any) => {
    const entryData = {
      car_id: entry.id,
      //@ts-ignore
      action_type: selectedEntry.action,
      datetime: formatISODate(entry.date),
    };
    try {
      await updateEntry(entry.comes_id, entryData);
      setSelectedEntry(null);
      getHistory();
      Toast.show({
        type: 'success',
        text1: 'Muvaffaqiyatli o‘zgartirildi!',
      });
    } catch (error) {
      console.error('Error editing data:', error);
      Toast.show({
        type: 'error',
        text1: 'Xatolik yuz berdi, qayta urining!',
      });
    }
  };

  const deleteEntry = async (entry:any) => {
    try {
      await removeEntry(entry.comes_id);
      setSelectedEntry(null);
      setShowRemoveDialog(false);
      getHistory();
      Toast.show({
        type: 'success',
        text1: 'Muvaffaqiyatli o‘chirildi!',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Xatolik yuz berdi, qayta urining!',
      });
      console.error('Error deleting data:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    //@ts-ignore
    navigation.navigate('index');
    // window.location.href = '/';
  };
  
  return (
    <View className="flex-1 font-hyundai">
      <View className="flex-row bg-blue p-4 items-center">
        <Text className="flex-1 text-3xl font-bold text-white text-center font-hyundai">
          Moshina kirish-chiqishini qayd qilish
        </Text>
        <TouchableOpacity onPress={handleLogout} className="border border-white rounded-lg p-2">
          <Text className="text-white font-hyundai">Chiqish</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-1 flex-col md:flex-row">
        {/* Left Side: Cars List */}
        <View className="w-full md:w-1/2 bg-gray-100 p-4">
          <Text className="text-xl font-bold mb-4 font-hyundai">Moshinalar ro'yhati</Text>
          <ScrollView>
            {cars.map((car:any) => {
              const region = car.number.slice(0, 2);
              const plate = car.number.slice(2);
              return (
                <TouchableOpacity
                  key={car.id}
                  className="p-4 bg-white rounded-2xl flex-row justify-between items-center mb-4"
                  onPress={() => setSelectedCar(car)}
                >
                  <Text className="font-semibold text-xl font-hyundai">{car.staff_last_name} {car.staff_first_name}</Text>
                  <View className="flex-row">
                    <Text className="rounded-lg p-1 font-mono text-xl font-bold border-2 border-black border-e-0 rounded-e-none">{region}</Text>
                    <Text className="rounded-lg p-1 font-mono text-xl font-bold border-2 border-black rounded-s-none">{plate}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Side: History */}
        <View className="w-full md:w-1/2 bg-gray-200 p-4">
          <Text className="text-xl font-bold mb-4 font-hyundai">Kirish tarixi</Text>
          <ScrollView>
            {history.map((entry:any, index:number) => {
              const kirdi = 'text-green-700 ring-green-600/20 bg-green-50';
              const chiqdi = 'text-red-700 ring-red-600/10 bg-red-50';
              return (
                <TouchableOpacity
                  key={index}
                  className="p-4 bg-white rounded flex-row justify-between items-center mb-4"
                  onPress={() => setSelectedEntry(entry)}
                >
                  <View>
                    <Text className="font-medium text-lg font-hyundai">{entry.staff_last_name} {entry.staff_first_name}</Text>
                    <Text>{entry.number}</Text>
                  </View>
                  <View className="flex-row items-start">
                    <View className="mr-2">
                      <Text
                        className={`inline-flex w-fit items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset 
                          ${entry.action === 'entry' ? kirdi : chiqdi}
                        `}
                      >
                        {entry.action === 'entry' ? 'Kirdi' : 'Chiqdi'}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-2 font-hyundai">{formatDate(entry.date)}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {setShowRemoveDialog(true); setSelectedEntry(entry)}}
                      className="h-fit w-fit border border-red-500 bg-red-50 
                        rounded-lg px-3 py-1 me-2 mb-2"
                    >
                      <Text className="text-red-700 text-sm font-medium text-center font-hyundai">x</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Edit Dialog */}
        {selectedEntry && !showRemoveDialog && (
          <Modal transparent={true} visible={true}>
            <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
              <View className="bg-white p-6 rounded-2xl">
                <Text className="text-2xl font-bold mb-4 font-hyundai">O'zgartirish</Text>
                <Text className="mb-4 text-xl font-hyundai">{selectedEntry.staff_last_name} {selectedEntry.staff_first_name}: {selectedEntry.number}</Text>
                <View className="flex-row items-center space-x-4 justify-between mb-4">
                  <TouchableOpacity
                    className="flex-row items-center space-x-2"
                    onPress={() => setSelectedEntry({ ...selectedEntry, action: "entry" })}
                  >
                    <View className="h-5 w-5 border border-gray-400 rounded-full justify-center items-center">
                      {selectedEntry.action === "entry" && <View className="h-3 w-3 bg-green-500 rounded-full" />}
                    </View>
                    <Text className="text-green-600 font-hyundai">Kirdi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-row items-center space-x-2"
                    onPress={() => setSelectedEntry({ ...selectedEntry, action: "exit" })}
                  >
                    <View className="h-5 w-5 border border-gray-400 rounded-full justify-center items-center">
                      {selectedEntry.action === "exit" && <View className="h-3 w-3 bg-blue rounded-full" />}
                    </View>
                    <Text className="text-red font-hyundai">Chiqdi</Text>
                  </TouchableOpacity>
                </View>
                <Text className="mb-4 text-gray-500 font-hyundai">{formatDate(selectedEntry.date)}</Text>
                <View className="flex-row justify-center space-x-4">
                  <TouchableOpacity
                    className="px-4 py-2 bg-red rounded-xl"
                    onPress={() => setSelectedEntry(null)}
                  >
                    <Text className="text-white font-hyundai">Bekor qilish</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-4 py-2 bg-blue rounded-xl"
                    onPress={() => editEntry(selectedEntry)}
                  >
                    <Text className="text-white font-hyundai">Tasdiqlash</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Delete Dialog */}
        {selectedEntry && showRemoveDialog && (
          <Modal transparent={true} visible={true}>
            <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
              <View className="bg-white p-6 rounded-2xl">
                <Text className="text-2xl font-bold mb-4 font-hyundai">O'chirish</Text>
                <Text className="mb-4 text-xl font-hyundai">{selectedEntry.staff_last_name} {selectedEntry.staff_first_name}: {selectedEntry.number}</Text>
                <View className="flex-row items-center space-x-4 justify-between mb-4">
                  <View className="flex-row items-center space-x-2">
                    <View className="h-5 w-5 border border-gray-400 rounded-full justify-center items-center">
                      {selectedEntry.action === "entry" && <View className="h-3 w-3 bg-green-500 rounded-full" />}
                    </View>
                    <Text className="text-green-600 font-hyundai">Kirdi</Text>
                  </View>
                  <View className="flex-row items-center space-x-2">
                    <View className="h-5 w-5 border border-gray-400 rounded-full justify-center items-center">
                      {selectedEntry.action === "exit" && <View className="h-3 w-3 bg-blue rounded-full" />}
                    </View>
                    <Text className="text-red font-hyundai">Chiqdi</Text>
                  </View>
                </View>
                <Text className="mb-4 text-gray-500 font-hyundai">{formatDate(selectedEntry.date)}</Text>
                <View className="flex-row justify-center space-x-4">
                  <TouchableOpacity
                    className="px-4 py-2 bg-red rounded-xl"
                    onPress={() => { setSelectedEntry(null); setShowRemoveDialog(false); }}
                  >
                    <Text className="text-white font-hyundai">Bekor qilish</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-4 py-2 bg-blue rounded-xl"
                    onPress={() => deleteEntry(selectedEntry)}
                  >
                    <Text className="text-white font-hyundai">O'chirish</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Create Dialog */}
        {selectedCar && (
          <Modal transparent={true} visible={true}>
            <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
              <View className="bg-white p-6 rounded-2xl">
                <Text className="text-2xl font-bold mb-4 font-hyundai">Tasdiqlash</Text>
                <Text className="mb-4 text-xl font-hyundai">{selectedCar.staff_last_name} {selectedCar.staff_first_name}: {selectedCar.number}</Text>
                <View className="flex-row items-center space-x-4 justify-between mb-4">
                  <TouchableOpacity
                    className="flex-row items-center space-x-2"
                    onPress={() => setAction("entry")}
                  >
                    <View className="h-5 w-5 border border-gray-400 rounded-full justify-center items-center">
                      {action === "entry" && <View className="h-3 w-3 bg-green-500 rounded-full" />}
                    </View>
                    <Text className="text-green-600 font-hyundai">Kirdi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-row items-center space-x-2"
                    onPress={() => setAction("exit")}
                  >
                    <View className="h-5 w-5 border border-gray-400 rounded-full justify-center items-center">
                      {action === "exit" && <View className="h-3 w-3 bg-blue rounded-full" />}
                    </View>
                    <Text className="text-red font-hyundai">Chiqdi</Text>
                  </TouchableOpacity>
                </View>
                <Text className="mb-4 text-gray-500 font-hyundai">{formatDate(new Date(), "DD MMMM, HH:mm")}</Text>
                <View className="flex-row justify-center space-x-4">
                  <TouchableOpacity
                    className="px-4 py-2 bg-red rounded-xl"
                    onPress={() => setSelectedCar(null)}
                  >
                    <Text className="text-white font-hyundai">Bekor qilish</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-4 py-2 bg-blue rounded-xl"
                    onPress={() => createNewEntry(selectedCar)}
                  >
                    <Text className="text-white font-hyundai">Tasdiqlash</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </View>
  );
}