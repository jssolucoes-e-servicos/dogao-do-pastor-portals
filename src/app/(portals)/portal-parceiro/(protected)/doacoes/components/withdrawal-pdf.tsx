'use client';

import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 15, 
    backgroundColor: '#FFFFFF', 
    fontFamily: 'Helvetica' 
  },
  container: {
    border: '1pt solid #000',
    padding: 10,
    height: '100%',
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 10,
    borderBottom: '1pt dashed #000',
    paddingBottom: 10
  },
  logo: { 
    width: 50, 
    height: 50, 
    marginBottom: 5 
  },
  title: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    textTransform: 'uppercase' 
  },
  divider: {
    borderBottom: '1pt dashed #000',
    marginVertical: 10,
  },
  qrSection: { 
    alignItems: 'center', 
    marginVertical: 10 
  },
  qrImage: { 
    width: 100, 
    height: 100 
  },
  idText: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginTop: 5, 
    letterSpacing: 2 
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 4 
  },
  label: { fontSize: 9, textTransform: 'uppercase' },
  value: { fontSize: 9, fontWeight: 'bold' },
  
  tableHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
    marginTop: 10
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '0.5pt solid #EEE',
    paddingVertical: 3
  },
  itemText: { fontSize: 8 },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    fontSize: 7,
    paddingTop: 10,
    borderTop: '1pt dashed #000'
  }
});

export function WithdrawalPDF({ withdrawal, qrDataUri, logoDataUri }: { withdrawal: any, qrDataUri: string, logoDataUri: string }) {
  return (
    <Document>
      <Page size={[226, 340]} style={styles.page}> {/* Tamanho aproximado de bobina 80mm */}
        <View style={styles.container}>
          <View style={styles.header}>
            {logoDataUri && <Image src={logoDataUri} style={styles.logo} />}
            <Text style={styles.title}>Dogão do Pastor</Text>
            <Text style={{ fontSize: 7 }}>Comprovante de Doação / Retirada</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Horário:</Text>
            <Text style={styles.value}>{withdrawal.time}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Itens:</Text>
            <Text style={styles.value}>{withdrawal.total} un</Text>
          </View>

          <View style={styles.qrSection}>
            {qrDataUri && <Image src={qrDataUri} style={styles.qrImage} />}
            <Text style={styles.idText}>#{withdrawal.id}</Text>
          </View>

          <Text style={styles.tableHeader}>Detalhamento:</Text>
          {withdrawal.details.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.label}</Text>
              <Text style={styles.itemText}>{item.quantity}x</Text>
            </View>
          ))}

          <View style={styles.footer}>
            <Text>Este cupom deve ser apresentado na produção.</Text>
            <Text>{new Date().toLocaleString('pt-BR')}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}