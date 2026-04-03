import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '@features/auth/store';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    clearError();
    await login(email.trim(), password);
  };

  const isValid = email.trim().length > 0 && password.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo / Brand */}
          <View className="mb-12 items-center">
            <Text className="text-4xl font-sans-bold text-primary tracking-widest">
              OBSID
            </Text>
            <Text className="text-sm font-sans text-on-surface-muted mt-1">
              Sistema de Inventario
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            {/* Email */}
            <View>
              <Text className="text-xs font-sans-medium text-on-surface-variant uppercase tracking-wider mb-2">
                Correo electrónico
              </Text>
              <TextInput
                className="bg-surface-elevated border border-border rounded-card px-4 py-3 text-foreground font-sans text-base"
                placeholder="admin@ejemplo.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                editable={!isLoading}
              />
            </View>

            {/* Password */}
            <View>
              <Text className="text-xs font-sans-medium text-on-surface-variant uppercase tracking-wider mb-2">
                Contraseña
              </Text>
              <TextInput
                className="bg-surface-elevated border border-border rounded-card px-4 py-3 text-foreground font-sans text-base"
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!isLoading}
              />
            </View>

            {/* Error message */}
            {error ? (
              <View className="bg-error-bg border border-error-border rounded-md px-4 py-3">
                <Text className="text-error text-sm font-sans">{error}</Text>
              </View>
            ) : null}

            {/* Submit */}
            <TouchableOpacity
              className={`rounded-card py-4 items-center mt-2 ${
                isValid && !isLoading ? 'bg-primary' : 'bg-surface-elevated'
              }`}
              onPress={handleLogin}
              disabled={!isValid || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text
                  className={`font-sans-semibold text-base ${
                    isValid ? 'text-white' : 'text-on-surface-muted'
                  }`}
                >
                  Iniciar sesión
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
