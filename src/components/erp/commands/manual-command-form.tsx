"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreateManualCommandAction } from "@/actions/commands/create-manual.action"
import { CustomersPaginateAction } from "@/actions/customers/paginate.action"
import { SellersPaginateAction } from "@/actions/sellers/paginate.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SellerEntity } from "@/common/entities"
import { 
  User, 
  MapPin, 
  Plus, 
  Trash2, 
  Tag as TagIcon, 
  Save, 
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  Truck
} from "lucide-react"
import { toast } from "sonner"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ManualCommandForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchingCustomer, setSearchingCustomer] = useState(false)
  const [searchingSeller, setSearchingSeller] = useState(false)
  
  const [seller, setSeller] = useState<SellerEntity | null>(null)
  const [sellerTag, setSellerTag] = useState("")

  const [form, setForm] = useState({
    customerName: "",
    cpf: "",
    phone: "",
    deliveryOption: "DELIVERY",
    scheduledTime: "",
    observation: "",
    address: {
      street: "",
      number: "",
      neighborhood: "",
      city: "Porto Alegre",
      state: "RS",
      zipCode: "",
      complement: "",
    },
    items: [{ removedIngredients: [] as string[] }]
  })

  // Lookup Seller by Tag
  const lookupSeller = async () => {
    if (!sellerTag) return
    setSearchingSeller(true)
    try {
      const res = await SellersPaginateAction(1, sellerTag)
      if (res.success && res.data && res.data.data && res.data.data.length > 0) {
        setSeller(res.data.data[0])
        toast.success(`Vendedor: ${res.data.data[0].contributor?.name || res.data.data[0].name}`)
      } else {
        setSeller(null)
        toast.error("Vendedor não encontrado")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erro ao buscar vendedor")
    } finally {
      setSearchingSeller(false)
    }
  }

  // Lookup Customer by Phone
  const lookupCustomer = async () => {
    if (form.phone.length < 8) return
    setSearchingCustomer(true)
    try {
      const res = await CustomersPaginateAction(1, form.phone)
      if (res.success && res.data && res.data.data && res.data.data.length > 0) {
        const customer = res.data.data[0]
        const lastAddress = customer.addresses?.[0]
        
        setForm(prev => ({
          ...prev,
          customerName: customer.name,
          cpf: customer.cpf || "",
          address: lastAddress ? {
            street: lastAddress.street,
            number: lastAddress.number,
            neighborhood: lastAddress.neighborhood,
            city: lastAddress.city,
            state: lastAddress.state,
            zipCode: lastAddress.zipCode,
            complement: lastAddress.complement || "",
          } : prev.address
        }))
        toast.success("Cliente encontrado!")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSearchingCustomer(false)
    }
  }

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { removedIngredients: [] }]
    }))
  }

  const removeItem = (index: number) => {
    if (form.items.length === 1) return
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!seller) {
      toast.error("Por favor, identifique o vendedor pela TAG.")
      return
    }

    setLoading(true)
    try {
      const res = await CreateManualCommandAction({
        ...form,
        sellerId: seller.id
      })

      if (res.success) {
        toast.success("Comanda registrada com sucesso!")
        router.push("/erp/comandas")
      } else {
        toast.error(res.error || "Erro ao registrar comanda")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erro inesperado ao registrar comanda")
    } finally {
      setLoading(false)
    }
  }

  const showAddress = form.deliveryOption === "DELIVERY" || form.deliveryOption === "DONATE"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Vendedor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-primary" />
            Identificação do Vendedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="sellerTag">TAG do Vendedor</Label>
              <div className="flex gap-2">
                <Input 
                  id="sellerTag" 
                  placeholder="Ex: V01" 
                  value={sellerTag}
                  onChange={e => setSellerTag(e.target.value)}
                  disabled={!!seller}
                />
                {!seller ? (
                  <Button type="button" onClick={lookupSeller} disabled={searchingSeller || !sellerTag}>
                    {searchingSeller ? <Clock className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={() => { setSeller(null); setSellerTag(""); }}>
                    Alterar
                  </Button>
                )}
              </div>
            </div>
            {seller && (
              <div className="flex-1 p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">{seller.contributor?.name || seller.name}</p>
                  <p className="text-xs text-muted-foreground">TAG: {seller.tag}</p>
                </div>
                <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Input 
                  id="phone" 
                  placeholder="(51) 9...." 
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  onBlur={lookupCustomer}
                />
                {searchingCustomer && <Clock className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Nome Completo</Label>
              <Input 
                id="customerName" 
                placeholder="Nome do cliente" 
                value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (Opcional)</Label>
              <Input 
                id="cpf" 
                placeholder="000.000.000-00" 
                value={form.cpf}
                onChange={e => setForm({ ...form, cpf: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modalidade */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Modalidade e Itens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Entrega</Label>
              <Select 
                value={form.deliveryOption} 
                onValueChange={v => setForm({ ...form, deliveryOption: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DELIVERY">Entrega</SelectItem>
                  <SelectItem value="PICKUP">Retirada</SelectItem>
                  <SelectItem value="SCHEDULED">Agendado</SelectItem>
                  <SelectItem value="DONATE">Doação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Horário (Se agendado)</Label>
              <Input 
                type="time" 
                value={form.scheduledTime}
                onChange={e => setForm({ ...form, scheduledTime: e.target.value })}
              />
            </div>
          </div>

          {showAddress && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-primary font-bold">
                <MapPin className="h-4 w-4" />
                Endereço de Entrega
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Rua</Label>
                  <Input 
                    value={form.address.street}
                    onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                    required={form.deliveryOption === "DELIVERY"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input 
                    value={form.address.number}
                    onChange={e => setForm({ ...form, address: { ...form.address, number: e.target.value } })}
                    required={form.deliveryOption === "DELIVERY"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input 
                    value={form.address.neighborhood}
                    onChange={e => setForm({ ...form, address: { ...form.address, neighborhood: e.target.value } })}
                    required={form.deliveryOption === "DELIVERY"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input 
                    value={form.address.city}
                    onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                    required={form.deliveryOption === "DELIVERY"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input 
                    value={form.address.complement}
                    onChange={e => setForm({ ...form, address: { ...form.address, complement: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-primary font-bold">Dogões</Label>
              <Button type="button" size="sm" onClick={addItem} variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Add Mais um
              </Button>
            </div>
            
            {form.items.map((item, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Dogão #{idx + 1}</Badge>
                  {form.items.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeItem(idx)}
                      className="text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Remover Ingredientes? (Vírgula para separar)</Label>
                  <Input 
                    placeholder="Ex: Cebola, Mostarda..." 
                    onChange={e => {
                      const newItems = [...form.items]
                      newItems[idx].removedIngredients = e.target.value.split(",").map(i => i.trim()).filter(i => i)
                      setForm({ ...form, items: newItems })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="obs">Observações Gerais</Label>
            <Input 
              id="obs" 
              placeholder="Obs para cozinha ou entrega..." 
              value={form.observation}
              onChange={e => setForm({ ...form, observation: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/10 flex justify-between">
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button type="submit" disabled={loading || !seller} className="px-8">
            {loading ? <Clock className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Registrar Comanda Manual
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
