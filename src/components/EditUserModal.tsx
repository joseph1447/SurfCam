"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Save, Trash2 } from "lucide-react";
import { validateEmailClient } from "@/lib/emailValidation";
import ConfirmDialog from "@/components/ConfirmDialog";

interface User {
  _id: string;
  email: string;
  accessType: 'free' | 'premium';
  isActive: boolean;
  loginCount: number;
  lastLogin: string;
  createdAt: string;
}

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

export default function EditUserModal({ user, isOpen, onClose, onSave, onDelete }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    accessType: "free" as 'free' | 'premium',
    isActive: true,
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: true });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        accessType: user.accessType,
        isActive: user.isActive,
        password: ""
      });
      setError("");
      setEmailValidation({ isValid: true });
    }
  }, [user]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData(prev => ({ ...prev, email: newEmail }));
    
    // Clear validation if email is empty
    if (!newEmail.trim()) {
      setEmailValidation({ isValid: true });
      return;
    }
    
    // Validate email in real-time
    const validation = validateEmailClient(newEmail);
    setEmailValidation(validation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate email
      const emailValidation = validateEmailClient(formData.email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || "Email inválido");
        return;
      }

      // Prepare data for update
      const updateData: any = {
        email: formData.email,
        accessType: formData.accessType,
        isActive: formData.isActive
      };

      // Only include password if it's not empty
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      await onSave(updateData);
      onClose();
    } catch (error) {
      console.error("Update user error:", error);
      setError("Error al actualizar el usuario. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!user) return;
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError("");

    try {
      await onDelete(user._id);
      onClose();
    } catch (error) {
      console.error("Delete user error:", error);
      setError("Error al eliminar el usuario. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Editar Usuario</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              required
              className={`${
                formData.email && !emailValidation.isValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {formData.email && !emailValidation.isValid && (
              <p className="text-red-500 text-sm">{emailValidation.error}</p>
            )}
          </div>

          {/* Access Type */}
          <div className="space-y-2">
            <Label htmlFor="accessType">Tipo de Acceso</Label>
            <Select
              value={formData.accessType}
              onValueChange={(value: 'free' | 'premium') => 
                setFormData(prev => ({ ...prev, accessType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Gratuito</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Usuario Activo</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isActive: checked }))
              }
            />
          </div>

          {/* Password (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
            <Input
              id="password"
              type="password"
              placeholder="Dejar vacío para mantener la actual"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
            <p className="text-xs text-gray-500">
              Solo llena este campo si quieres cambiar la contraseña
            </p>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Logins:</strong> {user.loginCount}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Último login:</strong> {new Date(user.lastLogin).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Creado:</strong> {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !emailValidation.isValid}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Guardando...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Eliminando...
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar al usuario "${user?.email}"? Esta acción no se puede deshacer y se perderán todos los datos del usuario.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}
