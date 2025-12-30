# SurfCam Agent Skills Registry

This directory contains agent skill definitions for the SurfCam project. These agents are specialized personas designed to handle specific aspects of the application development and design.

## Available Agents

### 1. Designer Agent (`designer.md`)
**File:** `designer.md`  
**Purpose:** Professional frontend design and UX  
**When to Use:**
- Creating or reviewing component designs
- Developing color palettes and typography systems
- Designing animations and micro-interactions
- Auditing designs for generic patterns
- Brand consistency reviews

**Key Skills:**
- Component aesthetics
- Color theory & palettes
- Typography selection
- Animation design
- UX/UI best practices

**How to Reference:**
```
@Designer - Review this button component for aesthetic quality
@Designer - Suggest a color palette for the admin panel
@Designer - Create a motion strategy for the live stream
```

---

## How to Use Agents in SurfCam

1. **Reference in Issues/PRs:**
   ```
   @Designer - Please audit this page design
   ```

2. **Include in Prompts:**
   - "As the Designer agent, what improvements would you suggest?"
   - "Using the designer skill set, create a component design for..."

3. **Create New Agents:**
   - Add a new markdown file to `.agents/`
   - Include role, responsibilities, and how to reference
   - Update this `README.md` with the new agent

---

## Agent Guidelines

- **Specificity:** Each agent should have a well-defined, narrow focus
- **Context:** Include relevant context and philosophy
- **Reusability:** Make agents referenceable from multiple parts of the project
- **Documentation:** Clear, practical instructions on when and how to use

---

**Last Updated:** November 27, 2025  
**Project:** SurfCam
