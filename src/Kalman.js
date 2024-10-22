import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

class KalmanFilter {
  constructor(F, H, Q, R, P, x) {
    this.F = F;
    this.H = H;
    this.Q = Q;
    this.R = R;
    this.P = P;
    this.x = x;
  }

  predict() {
    this.x = this.F * this.x;
    this.P = this.F * this.P * this.F + this.Q;
    return this.x;
  }

  update(z) {
    const K = this.P * this.H / (this.H * this.P * this.H + this.R);
    this.x = this.x + K * (z - this.H * this.x);
    this.P = (1 - K * this.H) * this.P;
    return this.x;
  }
}

const Kalman = () => {
    const [params, setParams] = useState({
        frequency: 1,
        amplitude: 5,
        offset: 10,
        samplingInterval: 0.001,
        totalTime: 1,
        noiseVariance: 16
    });
    const [data, setData] = useState({ time: [], trueSignal: [], noisySignal: [], filteredSignal: [] });
  
    useEffect(() => {
        const F = 1, H = 1, Q = 1, R = 10, P = 1, x = 0;
        const kf = new KalmanFilter(F, H, Q, R, P, x);

        // const frequency = 1, amplitude = 5, offset = 10, samplingInterval = 0.001, totalTime = 1;
        // const noiseVariance = 16, noiseStdDev = Math.sqrt(noiseVariance);


        const { frequency, amplitude, offset, samplingInterval, totalTime, noiseVariance } = params;
        const noiseStdDev = Math.sqrt(noiseVariance);


        const timeSteps = Array.from({ length: totalTime / samplingInterval }, (_, i) => i * samplingInterval);
        const trueSignal = timeSteps.map(t => offset + amplitude * Math.sin(2 * Math.PI * frequency * t));
        const noisySignal = trueSignal.map(val => val + Math.random() * noiseStdDev);

        const kalmanEstimates = noisySignal.map(measurement => {
            kf.predict();
            return kf.update(measurement);
        });

        setData({ time: timeSteps, trueSignal, noisySignal, filteredSignal: kalmanEstimates });
    }, [params]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams(prevParams => ({ ...prevParams, [name]: parseFloat(value) }));
    };

  return (
    <>
        <div>
            <h3>Зміна параметрів</h3>
            <label>Частота:</label>
            <input type="number"name="frequency" value={params.frequency} onChange={handleChange}/>
            <br /><br/>

            <label>Амплітуда:</label>
            <input type="number" name="amplitude" value={params.amplitude} onChange={handleChange}/>
            <br /><br/>

            <label>Зсув:</label>
            <input type="number" name="offset" value={params.offset} onChange={handleChange}/>
            <br /><br/>

            <label>Інтервал вибірки:</label>
            <input type="number" step="0.001" name="samplingInterval" value={params.samplingInterval} onChange={handleChange}/>
            <br /><br/>

            <label>Загальний час:</label>
            <input type="number" name="totalTime" value={params.totalTime} onChange={handleChange}/>
            <br /><br/>

            <label>Варіація шуму:</label>
            <input type="number" name="noiseVariance" value={params.noiseVariance} onChange={handleChange}/>
            <br /><br/>
        </div>

        <Plot
        data={[
            { x: data.time, y: data.trueSignal, mode: 'lines', name: 'Справжній сигнал' },
            { x: data.time, y: data.noisySignal, mode: 'lines', name: 'Зашумлений сигнал' },
            { x: data.time, y: data.filteredSignal, mode: 'lines', name: 'Відфільтрований сигнал' }
        ]}
        layout={{ title: 'Фільтр Калмана', xaxis: { title: 'Час' }, yaxis: { title: 'Значення' }}}
        style={{ display: 'block', margin: '0 auto' }}
        />
    </>
  );
};

export default Kalman;
