import React, { useState } from 'react';
import { 
  Button as ReeloButton, 
  Input as ReeloInput,
  Card as ReeloCard,
  Modal as ReeloModal
} from '@reelo/ui-web';

export const PreviewComponents: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>
        UI Components Preview
      </h1>
      
      {/* Buttons Section */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Buttons</h2>
        
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Variants</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <ReeloButton variant="primary">Primary</ReeloButton>
            <ReeloButton variant="secondary">Secondary</ReeloButton>
            <ReeloButton variant="danger">Danger</ReeloButton>
            <ReeloButton variant="outline">Outline</ReeloButton>
            <ReeloButton variant="ghost">Ghost</ReeloButton>
            <ReeloButton disabled>Disabled</ReeloButton>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Sizes</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <ReeloButton size="sm">Small</ReeloButton>
            <ReeloButton size="default">Default</ReeloButton>
            <ReeloButton size="lg">Large</ReeloButton>
            <ReeloButton size="icon">🔍</ReeloButton>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Combinations</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <ReeloButton variant="primary" size="sm">Primary Small</ReeloButton>
            <ReeloButton variant="danger" size="lg">Danger Large</ReeloButton>
            <ReeloButton variant="outline" size="default">Outline Default</ReeloButton>
            <ReeloButton variant="ghost" size="sm">Ghost Small</ReeloButton>
          </div>
        </div>
      </section>

      {/* Inputs Section */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Inputs</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
          <ReeloInput
            label="Default Input"
            placeholder="Enter text..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <ReeloInput
            label="Required Input"
            placeholder="This is required"
            required
          />
          <ReeloInput
            label="Input with Error"
            placeholder="This has an error"
            error="This field is required"
          />
          <ReeloInput
            label="Disabled Input"
            placeholder="Disabled input"
            disabled
            value="Disabled value"
          />
          <ReeloInput
            label="Small Input"
            placeholder="Small size"
            size="sm"
          />
          <ReeloInput
            label="Large Input"
            placeholder="Large size"
            size="lg"
          />
          <ReeloInput
            label="Input with Helper Text"
            placeholder="Enter your email"
            helperText="We'll never share your email with anyone else."
          />
        </div>
      </section>

      {/* Cards Section */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Cards</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <ReeloCard 
            title="Default Card" 
            description="This is a default card with title and description."
          />
          <ReeloCard 
            title="Elevated Card" 
            description="Card with elevated variant for more emphasis."
            variant="elevated"
          />
          <ReeloCard 
            title="Outlined Card" 
            description="Card with outlined variant."
            variant="outlined"
          />
          <ReeloCard 
            title="Card with Footer" 
            description="Card that includes a footer with action buttons."
            footer={
              <div style={{ display: 'flex', gap: '8px' }}>
                <ReeloButton size="sm" variant="outline">Cancel</ReeloButton>
                <ReeloButton size="sm">Action</ReeloButton>
              </div>
            }
          />
          <ReeloCard 
            title="Clickable Card" 
            description="Click me to see the interaction!"
            variant="elevated"
            onClick={() => alert('Card clicked!')}
          />
          <ReeloCard 
            title="Custom Padding" 
            description="Card with custom padding settings."
            padding="sm"
          />
        </div>
      </section>

      {/* Modal Section */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Modal</h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <ReeloButton onClick={() => setIsModalOpen(true)}>
            Open Modal
          </ReeloButton>
        </div>

        <ReeloModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Test Modal"
          footer={
            <>
              <ReeloButton variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </ReeloButton>
              <ReeloButton onClick={() => setIsModalOpen(false)}>
                Confirm
              </ReeloButton>
            </>
          }
        >
          <p style={{ marginBottom: '16px' }}>This is a modal dialog. You can add any content here.</p>
          <ReeloInput
            label="Modal Input"
            placeholder="Input inside modal"
          />
        </ReeloModal>
      </section>
    </div>
  );
};


