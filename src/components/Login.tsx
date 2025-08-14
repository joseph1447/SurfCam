"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Waves, Contact } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
        if(error instanceof Error) {
            toast({
                title: "Error de inicio de sesión",
                description: error.message,
                variant: "destructive",
            });
        }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Waves className="h-12 w-12 text-primary"/>
          </div>
          <CardTitle className="font-headline text-2xl">Santa Teresa Surf Cam</CardTitle>
          <CardDescription>Inicia sesión para ver las olas en vivo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
            <p className="text-xs text-muted-foreground text-center w-full">
                La contraseña de acceso gratuito es 'santateresa2025'.
            </p>
            <div className="w-full pt-2 border-t border-border/50">
                <Link href="/contacto" className="w-full">
                    <Button variant="outline" className="w-full">
                        <Contact className="w-4 h-4 mr-2" />
                        Ver Planes Premium
                    </Button>
                </Link>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
