import { useEffect, useState } from "react";
import { Accordion, AccordionItem, Card, Chip, Divider, Spinner } from "@heroui/react";
import api from "../../services/api"; 

const ConversionMatrix = ({ refreshKey }) => {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/conversion/');
        setRules(response.data); 
      } catch (err) {
        console.error("Error al obtener las reglas:", err);
        setError("No se pudo cargar la matriz de conversión.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRules();
  }, [refreshKey]);

  // Agrupamos las reglas por origen (Lógica de transformación de datos)
  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.origen]) acc[rule.origen] = [];
    acc[rule.origen].push(rule);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Spinner label="Consultando reglas en Redis..." color="primary" labelColor="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 text-danger font-semibold">
        {error}
      </div>
    );
  }

  return (
    <Card className="mt-5">
      <div className="w-full mx-auto p-8">
        <Accordion variant="light" selectionMode="multiple" >
          {Object.entries(groupedRules).map(([origen, conversions]) => (
            <AccordionItem
              key={origen}
              aria-label={`Conversiones desde ${origen}`}
              title={
                <span className="font-semibold">Origen: {origen}</span>
              }
            >
              <div className="flex flex-col gap-2 p-2">
                {conversions.map((conv, idx) => (
                  <div key={`${origen}-${conv.destino}-${idx}`} className="space-y-3">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-primary-600">
                          Destino: {conv.destino}
                        </h4>
                      </div>
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        color="primary"
                      >
                        v{conv.version}
                      </Chip>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {conv.mapping.map((m, i) => (
                        <div 
                          key={i} 
                          className="flex justify-between p-2 rounded-lg bg-default-100"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs uppercase text-default-500 font-bold">Rango</span>
                            <span className="text-sm">{m.min} - {m.max}</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-xs uppercase text-default-500 font-bold">Resultado</span>
                            <span className="text-sm">
                              {m.result} ({m.label})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {idx < conversions.length - 1 && <Divider className="my-4" />}
                  </div>
                ))}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Card>
  );
};

export default ConversionMatrix;