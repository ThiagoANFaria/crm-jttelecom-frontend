import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link, 
  Image, 
  List, 
  ListOrdered,
  Type,
  Variable,
  Save,
  Eye,
  Code,
  Palette,
  Trash2
} from 'lucide-react';
import { EmailTemplate, TemplateVariable } from '@/types/automation';

interface EmailTemplateEditorProps {
  template?: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
  onCancel?: () => void;
  availableVariables?: TemplateVariable[];
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  template,
  onSave,
  onCancel,
  availableVariables = []
}) => {
  const [activeTab, setActiveTab] = useState('design');
  const [subject, setSubject] = useState(template?.subject || '');
  const [senderName, setSenderName] = useState(template?.senderName || '');
  const [senderEmail, setSenderEmail] = useState(template?.senderEmail || '');
  const [htmlContent, setHtmlContent] = useState(template?.htmlContent || '<div style="font-family: Arial, sans-serif; padding: 20px;"><p>Olá {{lead.nome}},</p><p>Escreva seu conteúdo aqui...</p><p>Atenciosamente,<br>{{user.nome}}</p></div>');
  const [textContent, setTextContent] = useState(template?.textContent || '');
  const [previewMode, setPreviewMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Inicializar conteúdo de texto a partir do HTML se estiver vazio
  useEffect(() => {
    if (!textContent && htmlContent) {
      // Converter HTML para texto simples (implementação básica)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      setTextContent(tempDiv.textContent || '');
    }
  }, []);

  // Função para inserir variável na posição do cursor
  const insertVariable = (variable: TemplateVariable) => {
    if (activeTab === 'code') {
      // Inserir no HTML diretamente
      const variableText = `{{${variable.key}}}`;
      setHtmlContent(prev => prev + variableText);
    } else if (activeTab === 'design' && editorRef.current) {
      // Inserir no editor visual
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          const variableSpan = document.createElement('span');
          variableSpan.className = 'variable-tag';
          variableSpan.style.backgroundColor = '#e2f0ff';
          variableSpan.style.padding = '2px 4px';
          variableSpan.style.borderRadius = '3px';
          variableSpan.style.margin = '0 2px';
          variableSpan.style.color = '#0066cc';
          variableSpan.contentEditable = 'false';
          variableSpan.textContent = `{{${variable.key}}}`;
          
          range.deleteContents();
          range.insertNode(variableSpan);
          
          // Mover cursor após a variável inserida
          range.setStartAfter(variableSpan);
          range.setEndAfter(variableSpan);
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Atualizar HTML
          setHtmlContent(editorRef.current.innerHTML);
        }
      }
    }
  };

  // Aplicar formatação ao texto selecionado
  const applyFormat = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
  };

  // Inserir link
  const insertLink = () => {
    const url = prompt('Digite a URL do link:', 'https://');
    if (url) {
      applyFormat('createLink', url);
    }
  };

  // Inserir imagem
  const insertImage = () => {
    const url = prompt('Digite a URL da imagem:', 'https://');
    if (url) {
      const img = `<img src="${url}" alt="Imagem" style="max-width: 100%;" />`;
      document.execCommand('insertHTML', false, img);
      if (editorRef.current) {
        setHtmlContent(editorRef.current.innerHTML);
      }
    }
  };

  // Salvar template
  const handleSave = () => {
    const updatedTemplate: EmailTemplate = {
      id: template?.id || '',
      name: template?.name || 'Novo Template',
      subject,
      senderName,
      senderEmail,
      htmlContent,
      textContent,
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date(),
      tenantId: template?.tenantId || '',
      category: template?.category || 'marketing',
      tags: template?.tags || []
    };
    
    onSave(updatedTemplate);
  };

  // Renderizar preview do e-mail
  const renderPreview = () => {
    // Substituir variáveis por valores de exemplo
    let previewHtml = htmlContent;
    
    availableVariables.forEach(variable => {
      const regex = new RegExp(`{{${variable.key}}}`, 'g');
      previewHtml = previewHtml.replace(regex, variable.exampleValue || `[${variable.label}]`);
    });
    
    return (
      <div className="border rounded-md p-4 bg-white">
        <div className="mb-4 border-b pb-2">
          <div className="font-medium">De: {senderName} &lt;{senderEmail}&gt;</div>
          <div className="font-medium">Assunto: {subject}</div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {template?.id ? 'Editar Template' : 'Novo Template'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Configurações do e-mail */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Assunto do e-mail"
              />
            </div>
            
            <div>
              <Label htmlFor="senderName">Nome do Remetente</Label>
              <Input
                id="senderName"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Nome exibido para o destinatário"
              />
            </div>
            
            <div>
              <Label htmlFor="senderEmail">E-mail do Remetente</Label>
              <Input
                id="senderEmail"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="email@seudominio.com"
              />
            </div>
            
            <div className="border-t pt-4">
              <Label className="mb-2 block">Variáveis Disponíveis</Label>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {availableVariables.map((variable) => (
                  <Button
                    key={variable.key}
                    variant="outline"
                    size="sm"
                    className="mr-2 mb-2"
                    onClick={() => insertVariable(variable)}
                  >
                    <Variable className="h-4 w-4 mr-1" />
                    {variable.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor de e-mail */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Conteúdo do E-mail</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={previewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {previewMode ? 'Editando' : 'Preview'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {previewMode ? (
              renderPreview()
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="design">
                    <Palette className="h-4 w-4 mr-1" />
                    Design
                  </TabsTrigger>
                  <TabsTrigger value="code">
                    <Code className="h-4 w-4 mr-1" />
                    HTML
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <Type className="h-4 w-4 mr-1" />
                    Texto
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="design">
                  <div className="mb-4 flex flex-wrap gap-1 border-b pb-2">
                    <Button variant="ghost" size="sm" onClick={() => applyFormat('bold')}>
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => applyFormat('italic')}>
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => applyFormat('underline')}>
                      <Underline className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => applyFormat('justifyLeft')}>
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => applyFormat('justifyCenter')}>
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => applyFormat('justifyRight')}>
                      <AlignRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={insertLink}>
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={insertImage}>
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => applyFormat('insertUnorderedList')}>
                      <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => applyFormat('insertOrderedList')}>
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    
                    <Select onValueChange={(value) => applyFormat('formatBlock', value)}>
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue placeholder="Formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p">Parágrafo</SelectItem>
                        <SelectItem value="h1">Título 1</SelectItem>
                        <SelectItem value="h2">Título 2</SelectItem>
                        <SelectItem value="h3">Título 3</SelectItem>
                        <SelectItem value="h4">Título 4</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Palette className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="grid grid-cols-5 gap-1">
                          {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
                            '#FF00FF', '#00FFFF', '#808080', '#800000', '#808000', 
                            '#008000', '#800080', '#008080', '#000080', '#FFFFFF'].map(color => (
                            <div
                              key={color}
                              className="w-8 h-8 cursor-pointer border"
                              style={{ backgroundColor: color }}
                              onClick={() => applyFormat('foreColor', color)}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div
                    ref={editorRef}
                    className="border rounded-md p-4 min-h-[400px]"
                    contentEditable
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                  />
                </TabsContent>
                
                <TabsContent value="code">
                  <textarea
                    className="w-full min-h-[400px] font-mono text-sm p-4 border rounded-md"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                  />
                </TabsContent>
                
                <TabsContent value="text">
                  <textarea
                    className="w-full min-h-[400px] p-4 border rounded-md"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Versão em texto simples do e-mail (para clientes que não suportam HTML)"
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;

