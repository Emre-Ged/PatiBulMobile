// app/(tabs)/create/index.tsx
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native'
import { Appbar, SegmentedButtons } from 'react-native-paper'
import NewOfferScreen from './newOffer'
import NewRequestScreen from './newRequest'

export default function CreateScreen() {
  const [mode, setMode] = useState<'request'|'offer'>('request')

  return (
    <SafeAreaView style={{ flex:1 }}>
      <Appbar.Header>
        <Appbar.Content title={mode==='request' ? 'New Request' : 'New Offer'} />
      </Appbar.Header>

      <SegmentedButtons
        value={mode}
        onValueChange={setMode}
        buttons={[
          { value: 'request', label: 'Request' },
          { value: 'offer',   label: 'Offer'   },
        ]}
        style={{ margin:16 }}
      />

      {mode === 'request'
        ? <NewRequestScreen />
        : <NewOfferScreen   />}
    </SafeAreaView>
  )
}