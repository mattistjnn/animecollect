import React from 'react';
import { render } from '@testing-library/react-native';
import ProgressBar from '../components/ProgressBar';

describe('ProgressBar', () => {
  it('devrait afficher correctement une barre de progression', () => {
    const { getByText } = render(
      <ProgressBar 
        progress={75} 
        showPercentage={true}
        label="Test progression"
      />
    );

    // Vérifier que le label est affiché
    expect(getByText('Test progression')).toBeTruthy();
    
    // Vérifier que le pourcentage est affiché
    expect(getByText('75%')).toBeTruthy();
  });

  it('devrait limiter la progression entre 0 et 100', () => {
    const { getByText } = render(
      <ProgressBar 
        progress={150} 
        showPercentage={true}
      />
    );

    // Même si on passe 150, ça devrait afficher 100%
    expect(getByText('100%')).toBeTruthy();
  });

  it('devrait fonctionner sans props optionnelles', () => {
    const { toJSON } = render(
      <ProgressBar progress={50} />
    );

    // Le composant devrait se rendre sans erreur
    expect(toJSON()).toBeTruthy();
  });
});