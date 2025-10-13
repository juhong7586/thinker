import React, { useState } from 'react';

import styles from '../styles/Survey.module.css'

// Questions data configuration
const questionsData = [
  {
    id: 1,
    type: 'slider',
    question: "I can sense how others feel.",
    label: 'Please rate your empathy on a scale of 1 to 7',
    name: 'empathy1',
    required: true,
    errorMessage: 'This field is required',
    min: 1,
    max: 7
  },
  {
    id: 2,
    type: 'slider',
    question: "It is difficult for me to sense what my family think.",
    label: 'Please rate your empathy on a scale of 1 to 7',
    name: 'empathy2',
    required: true,
    errorMessage: 'This field is required',
    min: 1,
    max: 7
    ,
    invert: true
  },
  {
    id: 3,
    type: 'slider',
    question: "It is difficult for me to sense what my friends think.",
    label: 'Please rate your empathy on a scale of 1 to 7',
    name: 'empathy3',
    required: true,
    errorMessage: 'This field is required',
    min: 1,
    max: 7
    ,
    invert: true
  },
  {
    id: 4,
    type: 'slider',
    question: "It is difficult for me to sense what my neighbors think.",
    label: 'Please rate your empathy on a scale of 1 to 7',
    name: 'empathy4',
    required: true,
    errorMessage: 'This field is required',
    min: 1,
    max: 7,
    invert: true
  },
  {
    id: 5,
    type: 'checkbox',
    question: 'It is important to me that (      ) are okay.',
    label: 'Please select at least one option',
    name: 'empathy5',
    required: true,
    errorMessage: 'Please select at least one interest',
    options: [
      { value: 'self', label: 'Myself' },
      { value: 'family', label: 'My family' },
      { value: 'friends', label: 'My friends' },
      { value: 'classmates', label: 'My classmates and my teacher' },
      { value: 'school', label: 'My school' },
      { value: 'community', label: 'My community' },
      { value: 'country', label: 'My country' },
      { value: 'world', label: 'The world' }
    ]
  },
  {
    id: 6,
    type: 'radio',
    question: "I can see situations from my friends' perspectives.",
    label: 'Please select one option',
    name: 'empathy6',
    required: true,
    errorMessage: 'Please select an option',
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' }
    ]
  },
 {
    id: 7,
    type: 'checkbox',
    question: 'I can predict the needs of (      ).',
    label: 'Please select at least one option',
    name: 'empathy7',
    required: true,
    errorMessage: 'Please select at least one interest',
    options: [
      { value: 'self', label: 'Myself' },
      { value: 'family', label: 'My family' },
      { value: 'friends', label: 'My friends' },
      { value: 'classmates', label: 'My classmates and my teacher' },
      { value: 'school', label: 'My school' },
      { value: 'community', label: 'My community' },
      { value: 'country', label: 'My country' },
      { value: 'world', label: 'The world' }
    ]
  },
  {
    id: 8,
    type: 'text',
    question: "Please write three words when you are thinking about others.",
    label: 'It could be feelings, objects, or situations.',
    name: 'empathy8',
    required: true,
    errorMessage: 'This field is required'
  }
];

// Data handler functions
const dataHandler = {
  validateAnswer: (question, value) => {
    if (!question.required) return true;
    
    if (question.type === 'text') {
      return value && value.trim().length > 0;
    } else if (question.type === 'radio') {
      // Ensure value is defined and non-empty string
      return typeof value !== 'undefined' && value !== null && value !== '';
    } else if (question.type === 'checkbox') {
      return Array.isArray(value) && value.length > 0;
    } else if (question.type === 'slider') {
      // Accept numeric slider value. If user hasn't changed the slider, treat missing value as the question's min.
      const min = Number(question.min ?? 0);
      const max = Number(question.max ?? Number.MAX_SAFE_INTEGER);
      const v = (value === undefined || value === null || value === '') ? min : Number(value);
      return !Number.isNaN(v) && v >= min && v <= max;
    }
    return false;
  },

  submitData: async (formData) => {
    console.log('Form Data to Submit:', formData);
    
    try {
      const response = await fetch('https://fake-api-server.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      console.log('Submission attempted');
      return { success: true };
    } catch (error) {
      console.log('Expected error (fake server):', error.message);
      return { success: true }; // Return success anyway for demo
    }
  },

  formatFormData: (answers) => {
    const formatted = {};
    questionsData.forEach(question => {
      // If slider values should be inverted for scoring (e.g., reverse-coded items),
      // flip the numeric value so that high visible answers map to low scores.
      if (question.type === 'slider' && question.invert && answers[question.id] !== undefined && answers[question.id] !== null && answers[question.id] !== '') {
        const min = Number(question.min ?? 0);
        const max = Number(question.max ?? 0);
        const raw = Number(answers[question.id]);
        // inverted value = (min + max) - raw  (for 1..7 becomes 8 - raw)
        const inverted = (min + max) - raw;
        formatted[question.name] = Number.isNaN(inverted) ? null : inverted;
      } else {
        formatted[question.name] = answers[question.id] || null;
      }
    });
    return formatted;
  }
};

// Main Form Component
const SurveyForm = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalQuestions = questionsData.length;
  const currentQuestionData = questionsData[currentQuestion - 1];
  const progress = (currentQuestion / totalQuestions) * 100;

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    // mark touched for sliders (and other inputs if desired)
    setTouched(prev => ({ ...prev, [questionId]: true }));
    
    // Clear error when user starts typing/selecting
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: false
      }));
    }
  };

  const handleCheckboxChange = (questionId, optionValue) => {
    const currentValues = answers[questionId] || [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    
    handleInputChange(questionId, newValues);
  };

  const validateCurrentQuestion = () => {
    const question = currentQuestionData;
    const answer = answers[question.id];
    // Ensure the user actually provided an answer (not just relying on default rendering)
    // For sliders we treat a missing key as unanswered even if the UI shows the min value.
    let isValid;
    const hasAnswerKey = Object.prototype.hasOwnProperty.call(answers, question.id);

    if (question.required) {
      if (question.type === 'slider') {
        // require an explicit answer entry for sliders
        isValid = hasAnswerKey && dataHandler.validateAnswer(question, answers[question.id]);
      } else {
        isValid = dataHandler.validateAnswer(question, answer);
      }
    } else {
      isValid = dataHandler.validateAnswer(question, answer);
    }

    if (!isValid) {
      setErrors(prev => ({
        ...prev,
        [question.id]: true
      }));
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentQuestion()) {
      if (currentQuestion === totalQuestions) {
        handleSubmit();
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const formData = dataHandler.formatFormData(answers);
    const result = await dataHandler.submitData(formData);
    
    if (result.success) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        {/* Progress Bar */}
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        {!isSubmitted ? (
          <>
            {/* Question Display */}
            <div className="animate-fadeIn">
              <span className={styles.questionCounter}>
                Question {currentQuestion} of {totalQuestions}
              </span>

              <h2 className={styles.surveyTitle}>
                {currentQuestionData.question}
              </h2>

              <p className={styles.questionLabel}>{currentQuestionData.label}</p>

              {/* Text Input */}
              {currentQuestionData.type === 'text' && (
                <div>
                  <input
                    type="text"
                    value={answers[currentQuestionData.id] || ''}
                    onChange={(e) => handleInputChange(currentQuestionData.id, e.target.value)}
                    className={`${styles.input} w-full p-3 border-2 border-gray-200 rounded-lg text-lg focus:border-purple-600 focus:outline-none transition-colors`}
                    placeholder="Enter your answer..."
                  />
                  {!touched[currentQuestionData.id] && (
                    <div className={styles.sliderUntouchedHint}>Please enter your answer</div>
                  )}
                </div>
              )}

              {/* Radio Buttons */}
              {currentQuestionData.type === 'radio' && (
                <div className="space-y-3 mt-4">
                  {currentQuestionData.options.map(option => (
                    <label 
                      key={option.value}
                      className={styles.radioLabel}
                    >
                      <input
                        type="radio"
                        name={currentQuestionData.name}
                        value={option.value}
                        checked={answers[currentQuestionData.id] === option.value}
                        onChange={(e) => handleInputChange(currentQuestionData.id, e.target.value)}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioLabelText}>{option.label}</span>
                    </label>
                  ))}
                  {!touched[currentQuestionData.id] && (
                    <div className={styles.sliderUntouchedHint}>Please select an option</div>
                  )}
                </div>
              )}

              {/* Checkboxes */}
              {currentQuestionData.type === 'checkbox' && (
                <div className="space-y-3 mt-4">
                  {currentQuestionData.options.map(option => (
                    <label 
                      key={option.value}
                      className={styles.checkboxItem}
                    >
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={(answers[currentQuestionData.id] || []).includes(option.value)}
                        onChange={() => handleCheckboxChange(currentQuestionData.id, option.value)}
                        className={styles.checkboxInput}
                      />
                      <span className={styles.checkboxLabel}>{option.label}</span>
                    </label>
                  ))}
                  {!touched[currentQuestionData.id] && (
                    <div className={styles.sliderUntouchedHint}>Please select at least one option</div>
                  )}
                </div>
              )}

              {/* Slider */}
              {currentQuestionData.type === 'slider' && (
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min={currentQuestionData.min}
                    max={currentQuestionData.max}
                    value={answers[currentQuestionData.id] || currentQuestionData.min}
                    onChange={(e) => handleInputChange(currentQuestionData.id, e.target.value)}
                    className={styles.slider}
                  />
                  <div className={`${styles.sliderValue} ${!touched[currentQuestionData.id] ? styles.sliderUntouched : ''}`}>
                    {answers[currentQuestionData.id] || currentQuestionData.min}
                  </div>

                  {!touched[currentQuestionData.id] && (
                    <div className={styles.sliderUntouchedHint}>Please move the slider to answer</div>
                  )}

                  {/* Labels under slider */}
                  {(() => {
                    const labels = [
                      'Never',
                      'Almost never',
                      'Not really',
                      'Just a little',
                      'Kind of I do',
                      'Mostly I do',
                      'For sure I do',
                      
                    ];
                    const currentVal = Number(answers[currentQuestionData.id] ?? currentQuestionData.min);
                    return (
                      <div className={styles.sliderLabels}>
                        {labels.map((lbl, idx) => (
                          <div
                            key={idx}
                            className={`${styles.sliderLabel} ${currentVal === idx + 1 ? styles.sliderLabelActive : ''}`}
                          >
                            <div className={styles.tick}>{idx + 1}</div>
                            <div className={styles.labelText}>{lbl}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}


              {/* Error Message */}
              {errors[currentQuestionData.id] && (
                <p className={styles.errorMessage}>
                  {currentQuestionData.errorMessage}
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className={styles.buttonGroup}>
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 1}
                className={`${styles.surveyButton} ${styles.btnPrevious}`}
              >
                Previous
              </button>
              
              <button
                onClick={handleNext}
                className={`${styles.surveyButton} ${styles.btnNext}`}
              >
                {currentQuestion === totalQuestions ? 'Submit' : 'Next'}
              </button>
            </div>
          </>
        ) : (
          // Success Message
          <div className={`${styles.successMessage} animate-fadeIn`}>
            <div className={`${styles.successIcon}`}>✓</div>
            <h2 className={`${styles.successTitle}`}>
              Form Submitted Successfully!
            </h2>
            <p className={`${styles.successText}`}>
              Your responses have been recorded. Thank you for completing the form.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SurveyForm;