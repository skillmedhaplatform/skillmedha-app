import axios from 'axios';

/**
 * Service to fetch statistics and promotional content for the Login Page.
 */
export const loginPromoService = {
  /**
   * Fetches promotional statistics from the backend public API.
   * If the API fails, it gracefully falls back to static hardcoded data.
   * 
   * @returns {Promise<{
   *   badge: { studentCount: string },
   *   slides: Array<{ id: number, title: string, subtitle: string, description: string, features: Array<{ icon: string, title: string, value: string }> }>,
   *   stats: Array<{ id: number, value: string, label: string, growth: string }>
   * }>}
   */
  async getPromoData() {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_REST_URL || 'http://localhost:5000';
      const response = await axios.get(`${baseUrl}/api/public/stats`, {
        // timeout after 3s to avoid hanging the login page if backend is slow
        timeout: 3000,
      });

      if (response.data && response.data.success) {
        const data = response.data.data;

        // Format the numbers (e.g., 50000 -> 50K+)
        const formatCount = (num) => {
          if (!num) return "0+";
          if (num >= 1000) return `${Math.floor(num / 1000)}K+`;
          return `${num}+`;
        };

        const activeStudents = formatCount(data.totalStudents);
        const partnerColleges = formatCount(data.totalColleges);

        // Map real data to UI format
        return this._buildUiData({
          studentCount: data.totalStudents || 50000,
          activeStudentsStr: activeStudents,
          partnerCollegesStr: partnerColleges,
          placementRateStr: "94%" // Fallback for placement rate if not in API
        });
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.warn("LoginPromoService: Failed to fetch live stats, using fallback data. Error:", error.message);
      // Return Fallback Data
      return this._buildUiData({
        studentCount: 50000,
        activeStudentsStr: "50K+",
        partnerCollegesStr: "500+",
        placementRateStr: "94%"
      });
    }
  },

  /**
   * Internal helper to build the UI expected structure
   */
  _buildUiData({ studentCount, activeStudentsStr, partnerCollegesStr, placementRateStr }) {
    return {
      badge: {
        studentCount: studentCount.toLocaleString()
      },
      slides: [
        {
          id: 1,
          title: "Elevate Your",
          subtitle: "Learning Journey",
          description: "Access all your tools in one seamless platform. Connect, learn, and grow with the next generation of education technology.",
          features: [
            { icon: "courses", title: "Courses & practice tests", value: "200+" },
            { icon: "briefcase", title: "Live placement drives", value: "48" },
            { icon: "ai", title: "AI interview practice", value: "24/7" },
          ]
        },
        {
          id: 2,
          title: "Accelerate Your",
          subtitle: "Career Growth",
          description: "Gain industry-relevant skills with hands-on projects and assessments designed by top tier professionals.",
          features: [
            { icon: "globe", title: "Global hiring partners", value: "150+" },
            { icon: "star", title: "Industry-vetted curriculum", value: "100%" },
            { icon: "shield", title: "Verified certificates", value: "100%" },
          ]
        }
      ],
      stats: [
        {
          id: 1,
          value: activeStudentsStr,
          label: "Active students",
          growth: "↗ +12% this month"
        },
        {
          id: 2,
          value: placementRateStr,
          label: "Placement rate",
          growth: "↗ +3% vs last year"
        },
        {
          id: 3,
          value: partnerCollegesStr,
          label: "Partner colleges",
          growth: "↗ +28 this quarter"
        }
      ]
    };
  }
};
